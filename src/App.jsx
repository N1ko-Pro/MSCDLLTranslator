import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import MainTable from './components/MainTable'
import CustomTitlebar from './components/CustomTitlebar'

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [modData, setModData] = useState({ id: '', author: '', name: '', version: '', description: '' });
  const [modDataTranslations, setModDataTranslations] = useState({});
  const [originalStrings, setOriginalStrings] = useState([]);
  const [translations, setTranslations] = useState({});

  const handleOpenDLL = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openDll();
      if (result && result.success) {
        const data = result.data.modData;
        setModData(data);
        setOriginalStrings(result.data.strings);
        setModDataTranslations({
          version: data.version !== 'Unknown' ? data.version : '',
          author: data.author !== 'Unknown' ? data.author : '',
          id: data.id !== 'Unknown' ? data.id : ''
        });
        setTranslations({});
        setIsLoaded(true);
      }
    } else {
      // Fallback for browser / dev mode without electron APIs loaded properly
      setIsLoaded(true);
      setModData({ id: 'test_id', author: 'John', name: 'Test Mod', version: '1.0', description: 'desc' });
      setOriginalStrings([{ id: 1, original: "Start Engine" }, { id: 2, original: "Buy parts" }]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f0f13] overflow-hidden text-gray-200 antialiased font-sans">
      <CustomTitlebar />
      <div className="flex flex-1 min-h-0">
        <Sidebar 
          disabled={!isLoaded} 
          modData={modData} 
          translations={modDataTranslations}
          setTranslations={setModDataTranslations}
        />
        <MainTable 
          disabled={!isLoaded}
          originalStrings={originalStrings}
          translations={translations}
          setTranslations={setTranslations}
          onOpenDLL={handleOpenDLL}
        />
      </div>
    </div>
  )
}

export default App
