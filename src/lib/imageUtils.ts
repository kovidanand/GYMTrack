export interface ProcessedFoodImage {
  base64: string
  mimeType: string
  dataUrl: string
  width: number
  height: number
  originalSize: number
  compressedSize: number
}

/**
 * Validates and safely resizes meal photos to prevent huge base64 payload transfers
 * over mobile networks and adhere to Supabase Edge Function size constraints.
 * Preserves visual clarity and aspect ratio for Google Gemini 1.5 Flash Vision.
 */
export async function processFoodImage(
  file: File,
  maxDimension = 1280,
  quality = 0.85
): Promise<ProcessedFoodImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPEG, PNG, or WebP).')
  }

  // Max 20MB raw file limit
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('Image file is too large (maximum 20MB).')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file from device.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to decode image data.'))
      img.onload = () => {
        let { width, height } = img

        // Calculate aspect-ratio preserving dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, width)
        canvas.height = Math.max(1, height)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas 2D context is unavailable.'))
          return
        }

        // Draw and compress image to JPEG
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const mimeType = 'image/jpeg'
        const dataUrl = canvas.toDataURL(mimeType, quality)
        const base64 = dataUrl.split(',')[1]

        if (!base64) {
          reject(new Error('Failed to generate image base64 data.'))
          return
        }

        resolve({
          base64,
          mimeType,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
          compressedSize: Math.round((base64.length * 3) / 4),
        })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
