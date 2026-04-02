import React, { useState, useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotify = (e) => {
      const { id, type, title, message, duration } = e.detail;
      setNotifications(prev => [...prev, { id, type, title, message }]);

      if (duration) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    };

    window.addEventListener('app-notification', handleNotify);
    return () => window.removeEventListener('app-notification', handleNotify);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none">
      {notifications.map(n => {
        const config = {
          success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
        }[n.type] || config.info;

        const Icon = config.icon;

        return (
          <div 
            key={n.id}
            className={`w-[360px] p-4 rounded-xl bg-[#18181b]/95 backdrop-blur-md border ${config.border} shadow-2xl flex items-start gap-3 pointer-events-auto animate-in slide-in-from-top-8 fade-in duration-300`}
          >
            <div className={`mt-0.5 shrink-0 ${config.bg} p-1.5 rounded-lg ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              {n.title && <h4 className="text-sm font-bold text-zinc-200">{n.title}</h4>}
              {n.message && <p className="text-xs text-zinc-400 mt-1 leading-snug">{n.message}</p>}
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
