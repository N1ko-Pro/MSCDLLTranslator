import React, { useState, useRef, useEffect, useCallback } from 'react';
import UnsavedChangesModal from '../Shared/NotifModal/UnsavedChangesModal';
import { WindowControls, ProjectMenu } from './TitleBar_Utils/TitleBar_Buttons/TitleBarButtons';

export default function TitleBar({ currentProject, hasUnsavedChanges, onSaveProject, onCloseProject }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });
  const menuRef = useRef(null);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) window.electronAPI.maximize();
  };

  const executeClose = useCallback(
    (type) => {
      if (type === 'app') {
        if (window.electronAPI?.close) window.electronAPI.close();
      } else if (type === 'project') {
        if (onCloseProject) onCloseProject();
      }
      setConfirmModal({ isOpen: false, type: null });
    },
    [onCloseProject]
  );

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setConfirmModal({ isOpen: true, type: 'app' });
    } else {
      executeClose('app');
    }
  }, [hasUnsavedChanges, executeClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    let unsubscribeOsClose = () => {};
    if (window.electronAPI?.onOsClose) {
      unsubscribeOsClose = window.electronAPI.onOsClose(handleClose);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      unsubscribeOsClose();
    };
  }, [handleClose]);

  const handleCloseProjectClick = () => {
    setIsMenuOpen(false);
    if (hasUnsavedChanges) {
      setConfirmModal({ isOpen: true, type: 'project' });
    } else {
      executeClose('project');
    }
  };

  return (
    <div
      className="h-8 bg-[#0f0f13] flex items-center justify-between select-none shrink-0 border-b border-white/5 relative z-[100]"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex-1 flex items-center h-full">
        {currentProject && (
          <div ref={menuRef} className="relative h-full flex items-center pl-[340px]" style={{ WebkitAppRegion: 'no-drag' }}>
            <div className="pl-0 h-full flex items-center">
              <ProjectMenu
                isMenuOpen={isMenuOpen}
                hasUnsavedChanges={hasUnsavedChanges}
                projectName={currentProject.projectName}
                onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                onSaveProject={() => {
                  setIsMenuOpen(false);
                  if (onSaveProject) onSaveProject();
                }}
                onCloseProject={handleCloseProjectClick}
              />
            </div>
          </div>
        )}
      </div>

      <WindowControls onMinimize={handleMinimize} onMaximize={handleMaximize} onClose={handleClose} />

      <UnsavedChangesModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onDiscardAndClose={executeClose}
        onSaveAndClose={async (type) => {
          if (onSaveProject) await onSaveProject();
          executeClose(type);
        }}
      />
    </div>
  );
}
