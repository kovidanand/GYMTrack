import React, { useRef } from 'react'
import {
  Plus,
  Camera,
  Upload,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Sparkles,
} from 'lucide-react'
import type { MealType } from '@/types/nutrition'

interface DashboardActionCardsProps {
  onOpenAddModal: (mealType?: MealType) => void
  onOpenCameraModal: (mode: 'camera' | 'upload') => void
  onFileSelected?: (file: File) => void
}

export function DashboardActionCards({
  onOpenAddModal,
  onOpenCameraModal,
}: DashboardActionCardsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    onOpenCameraModal('upload')
  }

  const handleCameraClick = () => {
    onOpenCameraModal('camera')
  }

  return (
    <div className="space-y-4">
      {/* ─── CARD 1: LOG A MEAL ─── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-surface-200/90 shadow-2xs hover:border-emerald-200/80 transition-all flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Plus size={24} className="stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-black text-surface-900 tracking-tight leading-tight">
                Log a meal
              </h3>
              <p className="text-xs text-surface-500 font-medium mt-1 leading-relaxed">
                Add food items to your diary to track calories and macros with precision.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => onOpenAddModal('breakfast')}
            id="sidebar-log-meal-btn"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Log new food</span>
          </button>

          {/* Quick-Select Meal Type Chips */}
          <div className="pt-2 border-t border-surface-100">
            <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block mb-2">
              Quick select meal
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onOpenAddModal('breakfast')}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-surface-700 bg-surface-50 hover:bg-surface-100 border border-surface-200/70 transition-colors flex items-center gap-1.5"
              >
                <Coffee size={13} className="text-amber-600" />
                <span>Breakfast</span>
              </button>
              <button
                onClick={() => onOpenAddModal('lunch')}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-surface-700 bg-surface-50 hover:bg-surface-100 border border-surface-200/70 transition-colors flex items-center gap-1.5"
              >
                <Sun size={13} className="text-emerald-600" />
                <span>Lunch</span>
              </button>
              <button
                onClick={() => onOpenAddModal('dinner')}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-surface-700 bg-surface-50 hover:bg-surface-100 border border-surface-200/70 transition-colors flex items-center gap-1.5"
              >
                <Moon size={13} className="text-indigo-600" />
                <span>Dinner</span>
              </button>
              <button
                onClick={() => onOpenAddModal('snack')}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-surface-700 bg-surface-50 hover:bg-surface-100 border border-surface-200/70 transition-colors flex items-center gap-1.5"
              >
                <Cookie size={13} className="text-purple-600" />
                <span>Snacks</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CARD 2: SNAP YOUR MEAL (AI FOOD VISION) ─── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20 border border-emerald-200/90 shadow-2xs hover:border-emerald-300 transition-all">
        <div className="space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Camera size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-surface-900 tracking-tight leading-tight">
                  Snap your meal
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full border border-emerald-200">
                  AI Vision
                </span>
              </div>
              <p className="text-xs text-surface-500 font-medium mt-1 leading-relaxed">
                Take or upload a photo of your food. AI identifies ingredients and estimates portion nutrition.
              </p>
            </div>
          </div>

          {/* Action Buttons: Camera & Upload */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCameraClick}
              id="sidebar-camera-btn"
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <Camera size={14} />
              <span>Camera</span>
            </button>

            <button
              onClick={handleUploadClick}
              id="sidebar-upload-btn"
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-surface-700 bg-surface-100 hover:bg-surface-200 border border-surface-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload size={14} />
              <span>Upload</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-center gap-1.5 text-[11px] text-surface-400 font-medium pt-1">
            <Sparkles size={12} className="text-emerald-500 shrink-0" />
            <span>Review and edit every detected item before confirming.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
