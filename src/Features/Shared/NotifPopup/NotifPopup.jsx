import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const NOTIFICATION_STYLES = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const DEFAULT_STYLE = NOTIFICATION_STYLES.info;

export default function NotifPopup({ notification, onRemove }) {
  const config = NOTIFICATION_STYLES[notification.type] || DEFAULT_STYLE;
  const Icon = config.icon;

  return (
    <div
      className="w-[360px] p-4 rounded-2xl bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-start gap-4 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-500"
      style={{ animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      <div className={`mt-0.5 shrink-0 ${config.bg} p-2 rounded-xl border ${config.border} shadow-inner`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        {notification.title && <h4 className="text-[13px] font-bold text-white tracking-wide">{notification.title}</h4>}
        {notification.message && (
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="shrink-0 group/close p-1.5 -mr-1 -mt-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-zinc-500 group-hover/close:text-zinc-300 transition-colors" />
      </button>
    </div>
  );
}
