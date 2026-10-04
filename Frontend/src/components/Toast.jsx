import React, { useEffect } from 'react'

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: {
      bg: 'bg-white',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: '✓',
      border: 'border-green-200',
      shadow: 'shadow-[0_8px_30px_rgba(22,163,74,0.15)]'
    },
    error: {
      bg: 'bg-white',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: '✕',
      border: 'border-red-200',
      shadow: 'shadow-[0_8px_30px_rgba(220,38,38,0.15)]'
    },
    info: {
      bg: 'bg-white',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'ℹ',
      border: 'border-blue-200',
      shadow: 'shadow-[0_8px_30px_rgba(37,99,235,0.15)]'
    },
    warning: {
      bg: 'bg-white',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      icon: '⚠',
      border: 'border-orange-200',
      shadow: 'shadow-[0_8px_30px_rgba(241,90,41,0.15)]'
    }
  }[type] || {
    bg: 'bg-white',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: 'ℹ',
    border: 'border-blue-200',
    shadow: 'shadow-[0_8px_30px_rgba(37,99,235,0.15)]'
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`${styles.bg} ${styles.shadow} border ${styles.border} px-5 py-4 rounded-2xl flex items-center gap-3 min-w-[320px] max-w-md`}>
        <div className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-sm font-bold ${styles.iconColor}`}>{styles.icon}</span>
        </div>
        <span className="flex-1 font-medium text-[#3D1A00] text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-[#A8998A] hover:text-[#3D1A00] transition-colors ml-2 text-lg leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default Toast