import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle
} from 'react-resizable-panels';
import { Header } from './Header';
import { CodeEditor } from './Editor';
import { Preview } from './Preview';
import { Sidebar } from './Sidebar';
import { GripVertical, Code, Eye } from 'lucide-react';
import { usePlayground } from '../contexts/PlaygroundContext';

export function Layout() {
  const { 
    mobileTab, 
    setMobileTab, 
    isSidebarOpen, 
    setIsSidebarOpen 
  } = usePlayground();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header />

      <div className="flex-1 overflow-hidden flex relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 shadow-xl transform transition-transform animate-in slide-in-from-left">
              <Sidebar />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col h-full">
          {/* Desktop Layout */}
          <div className="hidden md:block h-full">
            <PanelGroup orientation="horizontal" className="h-full">
              {/* EDITOR */}
              <Panel
                defaultSize={50}
                minSize={20}
                className="flex flex-col w-full min-w-0"
              >
                <CodeEditor />
              </Panel>
  
              <PanelResizeHandle className="w-2 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center group">
                <GripVertical className="w-3 h-3 text-gray-300 group-hover:text-white" />
              </PanelResizeHandle>
  
              {/* PREVIEW */}
              <Panel
                defaultSize={50}
                minSize={20}
                className="flex flex-col w-full min-w-0"
              >
                <Preview />
              </Panel>
            </PanelGroup>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex-1 h-full overflow-hidden">
            {mobileTab === 'editor' ? (
              <CodeEditor />
            ) : (
              <Preview />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden h-14 border-t bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 flex items-center justify-around px-4 z-40">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            mobileTab === 'editor'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Code className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            mobileTab === 'preview'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
