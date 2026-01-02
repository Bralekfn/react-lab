import { useRef, type ChangeEvent } from 'react';
import { usePlayground } from '../contexts/PlaygroundContext';
import { Download, Upload, Trash2, FileCode } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function Sidebar() {
  const { 
    files, 
    activeFile, 
    setActiveFile, 
    addFile, 
    deleteFile, 
    clearProject,
    setIsSidebarOpen
  } = usePlayground();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleExport = async () => {
    const zip = new JSZip();
    Object.values(files).forEach((file) => {
      zip.file(file.name, file.content);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'react-lab-project.zip');
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const zip = await JSZip.loadAsync(file);
        
        zip.forEach(async (relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            const content = await zipEntry.async('string');
            addFile(relativePath, content);
          }
        });
      } catch (error) {
        console.error('Error importing project:', error);
        alert('Failed to import project. Please ensure it is a valid ZIP file.');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileClick = (fileName: string) => {
    setActiveFile(fileName);
    setIsSidebarOpen(false); // Close sidebar on mobile when file is selected
  };

  const handleTouchStart = (fileName: string) => {
    if (fileName === 'index.js') return; // Cannot delete index.js
    
    longPressTimerRef.current = setTimeout(() => {
      if (window.confirm(`Delete ${fileName}?`)) {
        deleteFile(fileName);
      }
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <aside className="h-full w-full min-w-0 flex flex-col bg-gray-50 dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800">
      
      {/* Header */}
      <div className="w-full min-w-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Explorer
        </h2>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 shrink-0" />
            Import Files
          </button>

          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 shrink-0" />
            Export Project
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the project? This will remove all files and cannot be undone.')) {
                clearProject();
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            Clear Project
          </button>
        </div>
      </div>

      {/* Hidden input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
        multiple
        accept=".js,.jsx,.ts,.tsx,.css,.json"
      />

      {/* File list */}
      <div className="flex-1 w-full min-w-0 overflow-y-auto p-2">
        <div className="space-y-0.5 w-full">
          {Object.values(files).map((file) => (
            <div
              key={file.name}
              onClick={() => handleFileClick(file.name)}
              onTouchStart={() => handleTouchStart(file.name)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd} // Cancel if user scrolls
              className={`
                w-full min-w-0 group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                ${activeFile === file.name
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>

              {Object.keys(files).length > 1 && file.name !== 'index.js' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.name);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
