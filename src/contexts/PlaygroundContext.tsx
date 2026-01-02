import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { templates, type File } from '../data/templates';
import { decompressFiles } from '../utils/url-compression';
import { getSnippet } from '../lib/firebase';

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
  mobileTab: 'editor' | 'preview' | 'terminal';
  setMobileTab: (tab: 'editor' | 'preview' | 'terminal') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  dependencies: Record<string, string>;
  addDependency: (name: string, version?: string) => void;
  removeDependency: (name: string) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (isOpen: boolean) => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'terminal'>('editor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  
  // Dependencies state
  const [dependencies, setDependencies] = useState<Record<string, string>>(() => {
    try {
      const savedDeps = localStorage.getItem('react-lab-dependencies');
      return savedDeps ? JSON.parse(savedDeps) : (templates.list.dependencies || {});
    } catch (error) {
      console.error('Failed to load dependencies:', error);
      return templates.list.dependencies || {};
    }
  });

  // Save dependencies to localStorage
  useEffect(() => {
    localStorage.setItem('react-lab-dependencies', JSON.stringify(dependencies));
  }, [dependencies]);

  const addDependency = (name: string, version: string = 'latest') => {
    setDependencies(prev => ({ ...prev, [name]: version }));
  };

  const removeDependency = (name: string) => {
    setDependencies(prev => {
      const newDeps = { ...prev };
      delete newDeps[name];
      return newDeps;
    });
  };

  // Initialize state from localStorage or default to template
  const [files, setFiles] = useState<Record<string, File>>(() => {
    // 1. Check for compressed code in hash (legacy support + current)
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (hash) {
      const decompressed = decompressFiles(hash);
      if (decompressed) return decompressed;
    }
    
    // 2. Check localStorage
    try {
      const savedFiles = localStorage.getItem('react-lab-files-v2');
      return savedFiles ? JSON.parse(savedFiles) : templates.list.files;
    } catch (error) {
      console.error('Failed to load files from localStorage:', error);
      return templates.list.files;
    }
  });

  // Handle /s/:id routing asynchronously
  useEffect(() => {
    const checkSharedSnippet = async () => {
      const path = window.location.pathname;
      const match = path.match(/^\/s\/([a-zA-Z0-9]+)$/);
      
      if (match) {
        const shortId = match[1];
        try {
          const snippet = await getSnippet(shortId);
          if (snippet) {
            setFiles(snippet);
            // Also set active file to App.jsx or first file
            const newActive = snippet['App.jsx'] ? 'App.jsx' : Object.keys(snippet)[0];
            setActiveFile(newActive);
            // Clean URL but keep history
            window.history.replaceState({}, '', `/s/${shortId}`);
          } else {
            // Snippet not found, maybe redirect to home or show error
            // For now, just keep default files
            console.warn('Snippet not found');
            window.history.pushState({}, '', '/');
          }
        } catch (error) {
          console.error('Error loading snippet:', error);
        }
      }
    };

    checkSharedSnippet();
  }, []); // Run once on mount
  
  const [activeFile, setActiveFile] = useState<string>(() => {
    // Initial active file logic
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (hash) {
      const decompressed = decompressFiles(hash);
      if (decompressed) {
         return decompressed['App.jsx'] ? 'App.jsx' : Object.keys(decompressed)[0];
      }
    }

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
    
    // Set dependencies if available in template
    if (templates[templateKey].dependencies) {
      setDependencies(templates[templateKey].dependencies || {});
    } else {
      setDependencies({});
    }
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

    let language = 'javascript';
    if (fileName.endsWith('.css')) language = 'css';
    if (fileName.endsWith('.json')) language = 'json';
    if (fileName.endsWith('.html')) language = 'html';

    let defaultContent = content;
    if (!defaultContent) {
      if (fileName.endsWith('.css')) {
        defaultContent = '/* Styles */\n.container {\n  padding: 1rem;\n}';
      } else if (fileName.endsWith('.json')) {
        defaultContent = '{}';
      } else {
        defaultContent = `import React from 'react';\n\nexport default function ${fileName.replace('.jsx', '').replace('.js', '')}() {\n  return <div>New Component</div>;\n}`;
      }
    }

    setFiles(prev => ({
      ...prev,
      [fileName]: {
        name: fileName,
        language,
        content: defaultContent || ''
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
        setIsSidebarOpen,
        dependencies,
        addDependency,
        removeDependency,
        isTerminalOpen,
        setIsTerminalOpen
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
