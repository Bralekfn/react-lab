import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { templates, type File } from '../data/templates';

type TemplateKey = keyof typeof templates;

interface PlaygroundContextType {
  files: Record<string, File>;
  activeFile: string;
  setActiveFile: (fileName: string) => void;
  updateFileContent: (fileName: string, content: string) => void;
  addFile: (fileName: string, content?: string) => void;
  deleteFile: (fileName: string) => void;
  selectedTemplate: TemplateKey;
  setTemplate: (template: TemplateKey) => void;
  refreshKey: number;
  refreshPreview: () => void;
  clearProject: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileTab: 'editor' | 'preview';
  setMobileTab: (tab: 'editor' | 'preview') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize state from localStorage or default to template
  const [files, setFiles] = useState<Record<string, File>>(() => {
    try {
      const savedFiles = localStorage.getItem('react-lab-files-v2');
      return savedFiles ? JSON.parse(savedFiles) : templates.list.files;
    } catch (error) {
      console.error('Failed to load files from localStorage:', error);
      return templates.list.files;
    }
  });
  
  const [activeFile, setActiveFile] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('react-lab-active-file-v2');
      return savedActive || templates.list.activeFile;
    } catch (error) {
      return templates.list.activeFile;
    }
  });

  // Persist files and activeFile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('react-lab-files-v2', JSON.stringify(files));
    } catch (error) {
      console.error('Failed to save files to localStorage:', error);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem('react-lab-active-file-v2', activeFile);
    } catch (error) {
      console.error('Failed to save active file to localStorage:', error);
    }
  }, [activeFile]);

  // Initialize theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTemplate = (templateKey: TemplateKey) => {
    setSelectedTemplate(templateKey);
    setFiles(JSON.parse(JSON.stringify(templates[templateKey].files))); // Deep copy
    setActiveFile(templates[templateKey].activeFile);
  };

  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  const clearProject = () => {
    const emptyApp: File = {
      name: 'App.jsx',
      language: 'javascript',
      content: `import React from 'react';

export default function App() {
  return (
    <div className="p-4 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Hello React!</h1>
      <p>Start editing to create something amazing.</p>
    </div>
  );
}`
    };

    const indexFile: File = {
      name: 'index.js',
      language: 'javascript',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
    };

    setFiles({ 'App.jsx': emptyApp, 'index.js': indexFile });
    setActiveFile('App.jsx');
  };

  const updateFileContent = (fileName: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        content
      }
    }));
  };

  const addFile = (fileName: string, content?: string) => {
    if (files[fileName]) return;
    setFiles(prev => ({
      ...prev,
      [fileName]: {
        name: fileName,
        language: 'javascript',
        content: content || `import React from 'react';\n\nexport default function ${fileName.replace('.jsx', '').replace('.js', '')}() {\n  return <div>New Component</div>;\n}`
      }
    }));
    setActiveFile(fileName);
  };

  const deleteFile = (fileName: string) => {
    if (Object.keys(files).length <= 1) return; // Prevent deleting last file
    if (fileName === 'index.js') return; // Prevent deleting entry file
    
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fileName];
      return newFiles;
    });

    if (activeFile === fileName) {
      const remainingFiles = Object.keys(files).filter(f => f !== fileName);
      setActiveFile(remainingFiles[0]);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <PlaygroundContext.Provider
      value={{
        files,
        activeFile,
        setActiveFile,
        updateFileContent,
        addFile,
        deleteFile,
    selectedTemplate,
    setTemplate,
    refreshKey,
    refreshPreview,
    clearProject,
    theme,
        toggleTheme,
        mobileTab,
        setMobileTab,
        isSidebarOpen,
        setIsSidebarOpen
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (context === undefined) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
}
