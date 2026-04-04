import React from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconColorClass = "text-emerald-400",
  iconBgClass = "bg-emerald-500/20",
  iconBorderClass = "border-emerald-500/20",
  headerBgClass = "bg-emerald-500/5",
  gradientToClass = "to-emerald-500",
  gradientFromClass = "from-emerald-600",
  children,
  footer,
  maxWidthClass = "max-w-md"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className={`bg-[#131316] border border-white/10 rounded-2xl w-full ${maxWidthClass} shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200`}>
        {gradientFromClass && gradientToClass && (
           <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientFromClass} ${gradientToClass}`} />
        )}
        
        {(title || subtitle) && (
          <div className={`p-6 border-b border-white/5 flex items-center gap-4 ${headerBgClass}`}>
            {Icon && (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${iconBgClass} ${iconBorderClass}`}>
                <Icon className={`w-5 h-5 ${iconColorClass}`} />
              </div>
            )}
            <div>
              {title && <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>}
              {subtitle && <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t border-white/5 bg-black/20 flex flex-wrap items-center justify-end gap-3 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
