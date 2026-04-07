import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import Modal from '../../Core/ModalCore';

export default function PackModal({ isOpen, onClose, onPack, hasOriginalUuid }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Упаковка мода"
      subtitle="Вы уверены, что хотите сохранить все переводы и упаковать мод в .pak?"
      icon={Package}
      iconColorClass="text-indigo-400"
      iconBgClass="bg-indigo-500/20"
      iconBorderClass="border-indigo-500/20"
      headerBgClass="bg-indigo-500/5"
      gradientToClass="to-indigo-500"
      gradientFromClass="from-indigo-600"
      closeOnOverlayClick={false}
      footer={
        <div className="flex justify-center w-full">
          <button
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_10px_30px_rgba(79,70,229,0.25)] transition-all min-w-[180px]"
            onClick={onPack}
          >
            Упаковать
          </button>
        </div>
      }
      showCloseIcon
    >
      <div className="space-y-4">
        <p className="text-zinc-300 text-sm leading-relaxed">
          Новый <strong>.pak</strong> файл будет собран с вашими изменениями.
        </p>

        {hasOriginalUuid && (
          <div className="flex gap-3 p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-inner">
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-orange-200/90 text-sm leading-relaxed">
              <strong>ВНИМАНИЕ:</strong> используется оригинальный UUID мода. Это может привести к конфликтам, если
              установлены обе версии мода. Рекомендуется сгенерировать новый UUID в сайдбаре.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
