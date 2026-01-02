import { useEffect, useState, useRef, useCallback } from 'react';
import { transform } from '@babel/standalone';
import { usePlayground } from '../contexts/PlaygroundContext';
import { AlertCircle } from 'lucide-react';

export function Preview() {
  const { files, refreshKey } = usePlayground();
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  gray: {
                    950: '#030712',
                  }
                }
              }
            }
          }
        </script>
        <style>
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script>
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'ERROR', message: message }, '*');
          };
        </script>
      </body>
    </html>
  `;

  const updatePreview = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Transform all files
      const modules: Record<string, string> = {};
      
      for (const file of Object.values(files)) {
        try {
          const result = transform(file.content, {
            presets: ['react', 'env'],
            filename: file.name,
          }).code;
          
          // Normalize path: remove ./, ensure .jsx or .js extension matching
          // We will use simple name matching for now
          modules[file.name] = result;
          // Also add without extension for easier matching
          modules[file.name.replace(/\.(js|jsx|ts|tsx)$/, '')] = result;
        } catch (err: any) {
          throw new Error(`Error in ${file.name}: ${err.message}`);
        }
      }

      // 2. Create the runner script
      const script = `
        try {
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          const modules = {};
          const moduleCache = {};
          
          // Define modules
          ${Object.entries(modules).map(([name, code]) => `
            modules['${name}'] = function(module, exports, require) {
              ${code}
            };
          `).join('\n')}

          // Custom require function
          function require(path) {
            // Handle built-ins
            if (path === 'react') return React;
            if (path === 'react-dom') return ReactDOM;
            if (path === 'react-dom/client') return ReactDOM;
            
            // Normalize path (simple version)
            const cleanPath = path.replace(/^\\.\\//, '').replace(/\\.(js|jsx|ts|tsx)$/, '');
            
            // Try exact match first, then clean path
            const moduleKey = Object.keys(modules).find(k => 
              k === path || 
              k === cleanPath || 
              k.replace(/\\.(js|jsx|ts|tsx)$/, '') === cleanPath
            );
            
            if (!moduleKey) {
              throw new Error(\`Cannot find module '\${path}'\`);
            }
            
            if (moduleCache[moduleKey]) {
              return moduleCache[moduleKey].exports;
            }
            
            const module = { exports: {} };
            moduleCache[moduleKey] = module;
            
            // Execute module
            modules[moduleKey](module, module.exports, require);
            
            return module.exports;
          }

          // Start the app
          const hasIndex = Object.keys(modules).some(k => k === 'index.js' || k === 'index');
          
          if (hasIndex) {
            require('index');
          } else {
            // Fallback for backward compatibility
            const EntryModule = require('App');
            const RootComponent = EntryModule.default || EntryModule;
            
            if (RootComponent) {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(RootComponent));
            } else {
              throw new Error('App.jsx must default export a component');
            }
          }
          
        } catch (err) {
          window.parent.postMessage({ type: 'ERROR', message: err.message }, '*');
        }
      `;

      const iframe = iframeRef.current;
      if (!iframe) return;
      
      iframe.srcdoc = html.replace('</body>', `<script>${script}</script></body>`);
      
    } catch (err: any) {
      setError(err.message);
    }
  }, [files, html]);

  useEffect(() => {
    const timeoutId = setTimeout(updatePreview, 1000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [updatePreview]);

  useEffect(() => {
    if (refreshKey > 0) {
      updatePreview();
    }
  }, [refreshKey, updatePreview]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ERROR') {
        setError(event.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="h-full w-full relative bg-white">
      <iframe
        ref={iframeRef}
        title="preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
      
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 p-4 rounded-lg shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-2 z-50">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <pre className="text-sm whitespace-pre-wrap font-mono">{error}</pre>
        </div>
      )}
    </div>
  );
}
