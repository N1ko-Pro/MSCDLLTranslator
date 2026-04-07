import { useState, useCallback, useRef } from 'react';
import { notify } from '../Shared/NotificationCore_Utils/notifications';
import { useKeyboardShortcuts } from '../../Utils/Keyboard/useKeyboardShortcuts';
import {
  mapStringDictionaryToRows,
  createEmptyTranslations,
  resolvePersistedProjectName,
} from '../StartWindow/StartPage_Utils/projectData';

function buildTranslationsFingerprint(translations) {
  const entries = Object.entries(translations || {})
    .map(([key, value]) => [key, typeof value === 'string' ? value : String(value ?? '')])
    .filter(([, value]) => value !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(entries);
}

export function useProjectManager() {
  const [originalStrings, setOriginalStrings] = useState(null);
  const [translations, _setTranslations] = useState({});
  const [modInfo, setModInfo] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [originalPakPath, setOriginalPakPath] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingPak, setIsLoadingPak] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const lastSavedFingerprintRef = useRef(buildTranslationsFingerprint({}));

  const commitSavedSnapshot = useCallback((savedTranslations) => {
    lastSavedFingerprintRef.current = buildTranslationsFingerprint(savedTranslations);
    setHasUnsavedChanges(false);
  }, []);

  const setTranslations = useCallback((newTrans) => {
    _setTranslations((previous) => {
      const nextTranslations =
        typeof newTrans === 'function' ? newTrans(previous) : newTrans || {};

      const nextFingerprint = buildTranslationsFingerprint(nextTranslations);
      setHasUnsavedChanges(nextFingerprint !== lastSavedFingerprintRef.current);

      return nextTranslations;
    });
  }, []);

  const resetState = useCallback(() => {
    setOriginalStrings(null);
    _setTranslations({});
    setModInfo(null);
    setCurrentProjectId(null);
    setOriginalPakPath(null);
    commitSavedSnapshot({});
  }, [commitSavedSnapshot]);

  const handleOpenPak = useCallback(async () => {
    if (!window.electronAPI) return;

    setIsLoadingPak(true);
    try {
      const result = await window.electronAPI.selectAndUnpackPak();

      if (result && result.success && result.data) {
        setOriginalPakPath(result.data.originalPakPath);
        setCurrentProjectId(null);

        const { strings, modInfo } = result.data;
        const dataArray = mapStringDictionaryToRows(strings);

        setOriginalStrings(dataArray);
        setModInfo(modInfo);

        const emptyTrans = createEmptyTranslations(dataArray);
        _setTranslations(emptyTrans);
        setHasUnsavedChanges(false);

        notify.success('Мод загружен!', 'Файлы локализации и конфигурация успешно извлечены.', 3000);

        const projectData = {
          id: null,
          name: resolvePersistedProjectName({ translations: null, modInfo }),
          pakPath: result.data.originalPakPath,
          translations: emptyTrans,
        };

        const res = await window.electronAPI.saveProject(projectData);
        if (res && res.success) {
          setCurrentProjectId(res.project.id);
          commitSavedSnapshot(emptyTrans);
        }
      } else if (result?.error) {
        notify.error('Ошибка', result.error, 5000);
      }
    } finally {
      setIsLoadingPak(false);
    }
  }, [commitSavedSnapshot]);

  const handleSaveProject = useCallback(async () => {
    if (!originalStrings || !window.electronAPI || !originalPakPath) return;

    const projectData = {
      id: currentProjectId,
      name: resolvePersistedProjectName({ translations, modInfo }),
      pakPath: originalPakPath,
      translations,
    };

    const res = await window.electronAPI.saveProject(projectData);
    if (res && res.success) {
      setCurrentProjectId(res.project.id);
      commitSavedSnapshot(translations);
      notify.success('Сохранено', 'Проект успешно сохранён', 3000);
    } else {
      notify.error('Ошибка', 'Не удалось сохранить проект', 3000);
    }
  }, [originalStrings, originalPakPath, currentProjectId, translations, modInfo, commitSavedSnapshot]);

  const handleLoadProject = useCallback(
    async (projectSummary) => {
      if (!window.electronAPI) return;

      setIsLoadingProject(true);
      try {
        const res = await window.electronAPI.loadProject(projectSummary.id);

        if (res && res.success && res.data) {
          const { strings, modInfo, originalPakPath, translations: savedTrans } = res.data;
          const dataArray = mapStringDictionaryToRows(strings);
          const hydratedTranslations = {
            ...createEmptyTranslations(dataArray),
            ...(savedTrans || {}),
          };

          setOriginalStrings(dataArray);
          setModInfo(modInfo);
          _setTranslations(hydratedTranslations);
          setOriginalPakPath(originalPakPath);
          setCurrentProjectId(res.project?.id || projectSummary.id);
          commitSavedSnapshot(hydratedTranslations);

          notify.success('Проект загружен!', 'Настройки восстановлены.', 3000);
        } else {
          notify.error('Ошибка', res?.error || 'Не удалось загрузить проект', 5000);
        }
      } finally {
        setIsLoadingProject(false);
      }
    },
    [commitSavedSnapshot]
  );

  const handleSavePak = useCallback(async () => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.repackMod(translations);

    if (result && result.success) {
      notify.success('Мод переведен и запакован!', `Сохранен в: ${result.filePath}`, 5000);
    } else if (result?.error) {
      notify.error('Ошибка запаковки', result.error, 5000);
    }
  }, [translations]);

  useKeyboardShortcuts({
    onSave: handleSaveProject,
  });

  return {
    originalStrings,
    translations,
    setTranslations,
    modInfo,
    hasUnsavedChanges,
    isLoadingPak,
    isLoadingProject,
    handleOpenPak,
    handleSaveProject,
    handleCloseProject: resetState,
    handleLoadProject,
    handleSavePak,
  };
}
