import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingCore({
  isVisible,
  message = 'Загрузка мода...',
  description = 'Пожалуйста, подождите, идет распаковка и анализ файлов...',
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1a1a1e] rounded-lg p-8 shadow-2xl border border-gray-700 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-blue-400/20 rounded-full animate-ping" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">{message}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
