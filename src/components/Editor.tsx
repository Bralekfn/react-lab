import Editor, { type OnMount } from '@monaco-editor/react';
import { usePlayground } from '../contexts/PlaygroundContext';
import { FileTabs } from './FileTabs';

export function CodeEditor() {
  const { files, activeFile, updateFileContent, theme } = usePlayground();

  const handleEditorDidMount: OnMount = (_editor, monaco) => {
    // Configure default formatting options
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  };

  const currentFile = files[activeFile];

  if (!currentFile) {
    return <div className="h-full w-full bg-gray-50 dark:bg-[#1e1e1e] flex items-center justify-center text-gray-500">No file selected</div>;
  }

  const getLanguage = (file: { name: string; language?: string }) => {
    if (file.language) return file.language;
    if (file.name.endsWith('.css')) return 'css';
    if (file.name.endsWith('.json')) return 'json';
    if (file.name.endsWith('.html')) return 'html';
    return 'javascript';
  };

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-[#1e1e1e] flex flex-col">
      <FileTabs />
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          path={currentFile.name} // Key to keeping model state distinct
          defaultLanguage={getLanguage(currentFile)}
          language={getLanguage(currentFile)}
          value={currentFile.content}
          onChange={(value) => updateFileContent(activeFile, value || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            formatOnPaste: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
