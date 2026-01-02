import { useState, type FormEvent } from 'react';
import { usePlayground } from '../contexts/PlaygroundContext';
import { X, Plus, FileCode } from 'lucide-react';

export function FileTabs() {
  const { files, activeFile, setActiveFile, addFile, deleteFile } = usePlayground();
  const [isAdding, setIsAdding] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      setIsAdding(false);
      return;
    }
    
    let fileName = newFileName.trim();
    if (!fileName.endsWith('.jsx') && !fileName.endsWith('.js') && !fileName.endsWith('.css') && !fileName.endsWith('.json')) {
      fileName += '.jsx';
    }
    
    addFile(fileName);
    setNewFileName('');
    setIsAdding(false);
  };

  return (
    <div className="flex items-center bg-gray-100 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
      {Object.values(files).map((file) => (
        <div
          key={file.name}
          onClick={() => setActiveFile(file.name)}
          className={`
            group flex items-center gap-2 px-3 py-2.5 min-w-[120px] max-w-[200px] text-sm cursor-pointer border-r border-gray-200 dark:border-gray-800 select-none
            ${activeFile === file.name 
              ? 'bg-white dark:bg-[#1e1e1e] text-indigo-600 dark:text-blue-400 border-t-2 border-t-indigo-600 dark:border-t-blue-400' 
              : 'bg-gray-50 dark:bg-[#2d2d2d] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252526] border-t-2 border-t-transparent'
            }
          `}
        >
          <FileCode className="w-4 h-4 shrink-0" />
          <span className="truncate">{file.name}</span>
          
          {Object.keys(files).length > 1 && file.name !== 'index.js' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(file.name);
              }}
              className={`
                ml-auto p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all
                hover:bg-gray-200 dark:hover:bg-gray-700
                ${activeFile === file.name ? 'text-indigo-600 dark:text-blue-400' : 'text-gray-500'}
              `}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {isAdding ? (
        <form onSubmit={handleAddSubmit} className="flex items-center px-2 py-1 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800">
          <input
            autoFocus
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => setIsAdding(false)}
            placeholder="Name..."
            className="w-24 text-sm bg-transparent border-none focus:ring-0 p-1 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center w-10 h-full hover:bg-gray-200 dark:hover:bg-[#2d2d2d] text-gray-500 transition-colors"
          title="New File"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
