import { useCallback } from 'react';
import { notify } from '../Shared/NotificationCore_Utils/notifications';
import { toIdValueDictionary } from '../StartWindow/StartPage_Utils/projectData';

export default function useXmlManager({ originalStrings, setTranslations, modInfo }) {
  const handleExportXml = useCallback(async () => {
    if (!window.electronAPI || !originalStrings) return;

    const origDict = toIdValueDictionary(originalStrings, 'original');
    const result = await window.electronAPI.exportXml(origDict, modInfo);

    if (result && result.success) {
      notify.success('Успех!', 'Оригинальный текст успешно экспортирован в XML.', 3000);
    } else if (result?.error) {
      notify.error('Ошибка экспорта', result.error, 5000);
    }
  }, [originalStrings, modInfo]);

  const handleImportXml = useCallback(async () => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.importXml();

    if (result && result.success) {
      setTranslations((prev) => ({
        ...prev,
        ...result.translations,
      }));
      notify.success('Успех!', 'Перевод успешно импортирован из XML.', 3000);
    } else if (result?.error) {
      notify.error('Ошибка импорта', result.error, 5000);
    }
  }, [setTranslations]);

  return {
    handleExportXml,
    handleImportXml,
  };
}
