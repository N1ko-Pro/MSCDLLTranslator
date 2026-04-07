import React from 'react';
import { Settings, User, Folder, Hash, Info, Type, ScrollText, RefreshCw, HelpCircle } from 'lucide-react';
import InputField from './SideBar_Utils/InputField';
import DescriptionField from './SideBar_Utils/DescriptionField';

export default function SideBar({ disabled, modData, translations, setTranslations, packValidation, packValidationAttempt = 0 }) {
  const { uuid = '', author = '', name = '', description = '', folder = '' } = modData || {};

  const handleTranslate = (key, value) => {
    setTranslations((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateUUID = () => {
    setTranslations((prev) => ({ ...prev, uuid: crypto.randomUUID() }));
  };

  const currentModName = translations.name !== undefined ? translations.name : name ? name + '_RU' : '';
  const currentFolderName = currentModName ? currentModName.replace(/[^a-zA-Z0-9_-]/g, '_') : folder;
  const isOriginalUuid = !translations.uuid && !!uuid;
  const missingModDataFields = packValidation?.missingModDataFields || {};

  return (
    <div
      className={`w-[340px] border-r border-white/5 bg-[#131316]/90 backdrop-blur-xl flex flex-col h-full shrink-0 z-30 transition-all ${
        disabled ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''
      }`}
    >
      {/* Header Logo Area */}
      <div className="h-20 shrink-0 px-6 border-b border-white/5 flex items-center bg-[#131316]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[16px] font-bold text-zinc-100 leading-tight tracking-tight">BG3 Mod Translator</h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">v2.0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {/* Mod Info Card */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-4">
            <Info className="w-4 h-4 text-zinc-500" />
            <h2 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Данные мода</h2>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-shadow">
            <InputField
              icon={Type}
              label="Имя мода"
              original={name}
              value={translations.name !== undefined ? translations.name : name + '_RU'}
              onChange={(v) => handleTranslate('name', v)}
              isRequiredMissing={missingModDataFields.name}
              packValidationAttempt={packValidationAttempt}
            />
            <InputField icon={Folder} label="Папка мода" original={currentFolderName} readOnly={true} isFolder />
            <InputField
              icon={User}
              label="Автор"
              original={author}
              value={translations.author !== undefined ? translations.author : author}
              onChange={(v) => handleTranslate('author', v)}
              isRequiredMissing={missingModDataFields.author}
              packValidationAttempt={packValidationAttempt}
            />
            <div className="mt-2 pt-2 border-t border-white/5">
              <InputField
                icon={Hash}
                label="UUID мода"
                original={translations.uuid || uuid}
                readOnly={true}
                isOriginalUuid={isOriginalUuid}
                isRequiredMissing={missingModDataFields.uuid}
                packValidationAttempt={packValidationAttempt}
                headerEnd={
                  <div className="flex items-center gap-3">
                    {isOriginalUuid && (
                      <div className="relative group/tooltip flex items-center justify-center">
                        <HelpCircle className="w-[15px] h-[15px] text-orange-400 cursor-help hover:text-orange-300 transition-colors drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                        <div className="opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity absolute right-1/2 translate-x-[55%] top-[calc(100%+8px)] w-56 bg-[#18181b] border border-orange-500/40 text-orange-200/90 text-[12px] p-3 rounded-lg shadow-2xl z-50 text-center leading-relaxed">
                          Используется оригинальный UUID. Рекомендуется сгенерировать новый, нажав на кнопку "Сгенерировать".
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleGenerateUUID}
                      className="text-[9px] text-zinc-400 hover:text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded shadow-sm border border-white/5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Сгенерировать
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Description Card */}
        <section className="flex-1 pb-4">
          <div className="flex items-center gap-2 px-1 mb-4">
            <ScrollText className="w-4 h-4 text-zinc-500" />
            <h2 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Описание</h2>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-shadow">
            <DescriptionField
              original={description}
              value={translations.description || ''}
              onChange={(v) => handleTranslate('description', v)}
              isRequiredMissing={missingModDataFields.description}
              packValidationAttempt={packValidationAttempt}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
