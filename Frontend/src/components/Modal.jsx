import React, { useEffect } from 'react'

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const colors = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: 'text-amber-600',
      confirm: 'bg-amber-600 hover:bg-amber-700'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: 'text-red-600',
      confirm: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: 'text-blue-600',
      confirm: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const colorStyle = colors[type] || colors.warning

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D1A00]/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-orange-100 animate-scale-up overflow-hidden">
        {/* Header */}
        <div className={`${colorStyle.bg} p-5 border-b ${colorStyle.border}`}>
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${colorStyle.icon}`}>
              {type === 'danger' && '⚠️'}
              {type === 'warning' && '⚠️'}
              {type === 'info' && 'ℹ️'}
            </div>
            <h3 className="text-lg font-bold text-[#3D1A00]">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-[#5C4B3A] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-5 border-t border-orange-100 bg-cream">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[#3D1A00] bg-white border border-orange-200 rounded-full font-semibold hover:bg-orange-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-full font-semibold transition-colors shadow-md ${colorStyle.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  )
}

export default Modal