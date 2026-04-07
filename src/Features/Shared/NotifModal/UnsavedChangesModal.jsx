import React, { useState } from 'react';
import { AlertTriangle, Save, Trash } from 'lucide-react';
import Modal from '../../Core/ModalCore';

export default function UnsavedChangesModal({ isOpen, type, onClose, onDiscardAndClose, onSaveAndClose }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    try {
      if (onSaveAndClose) {
        await onSaveAndClose(type);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Несохранённые изменения"
      subtitle={type === 'app' ? 'Вы действительно хотите выйти?' : 'Вы действительно хотите закрыть проект?'}
      icon={AlertTriangle}
      iconColorClass="text-rose-400"
      iconBgClass="bg-rose-500/20"
      iconBorderClass="border-rose-500/20"
      headerBgClass="bg-rose-500/5"
      gradientToClass="to-rose-500"
      gradientFromClass="from-rose-600"
      closeOnOverlayClick={false}
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <button
            onClick={() => onDiscardAndClose(type)}
            disabled={isSaving}
            className="px-5 py-2.5 text-[13px] font-bold bg-rose-500 hover:bg-rose-400 text-white rounded-xl transition-all border border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Trash className="w-4 h-4" />
            <span>Не сохранять</span>
          </button>

          <button
            onClick={handleSaveAndClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-[13px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all border border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить и {type === 'app' ? 'выйти' : 'закрыть'}</span>
          </button>
        </div>
      }
      showCloseIcon
    >
      <p className="text-zinc-300 text-sm leading-relaxed">
        В проекте есть несохранённые изменения.
        <br />
        Пожалуйста, <strong>сохраните</strong> их перед тем, как{' '}
        {type === 'app' ? 'закрыть приложение' : 'закрыть проект'}.
      </p>
    </Modal>
  );
}
