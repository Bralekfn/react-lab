import { useEffect, useState, useRef, useCallback } from 'react';
import { transform } from '@babel/standalone';
import { usePlayground } from '../contexts/PlaygroundContext';
import { AlertCircle } from 'lucide-react';

export function Preview() {
  const { files, refreshKey, dependencies } = usePlayground();
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
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@18.2.0?dev",
              "react-dom/client": "https://esm.sh/react-dom@18.2.0/client?dev",
              "react-dom": "https://esm.sh/react-dom@18.2.0?dev",
              "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime?dev"
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
        <script>
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'ERROR', message: message }, '*');
          };
          window.process = window.process || {
            env: {
              NODE_ENV: 'development' 
            }
          };
          window.global = window;
        </script>
      </body>
    </html>
  `;

  const updatePreview = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Transform all files
      const modules: Record<string, string> = {};
      const usedImports = new Set<string>();
      let cssContent = '';
      
      for (const file of Object.values(files)) {
        if (file.name.endsWith('.css')) {
          cssContent += `\n/* ${file.name} */\n${file.content}`;
          continue;
        }

        try {
          const result = transform(file.content, {
            presets: ['react', 'env'],
            filename: file.name,
          }).code;
          
          // Find all require calls to identify external dependencies
          const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
          let match;
          while ((match = requireRegex.exec(result)) !== null) {
            usedImports.add(match[1]);
          }

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
      const dependenciesMap = JSON.stringify(dependencies);
      const importsList = JSON.stringify(Array.from(usedImports));
      
      const script = `
        (async () => {
        try {
          // Load React and ReactDOM first
          const ReactModule = await import('react');
          const ReactDOMModule = await import('react-dom');
          const ReactDOMClientModule = await import('react-dom/client');
          const JSXRuntimeModule = await import('react/jsx-runtime');
          
          window.React = ReactModule.default || ReactModule;
          window.ReactDOM = ReactDOMModule.default || ReactDOMModule;
          window.ReactDOMClient = ReactDOMClientModule.default || ReactDOMClientModule;
          window.JSXRuntime = JSXRuntimeModule;
          
          if (!window.React) {
            throw new Error('Failed to load React');
          }

          const { useState, useEffect, useRef, useMemo, useCallback } = window.React;
          
          const modules = {};
          const moduleCache = {};
          const dependencyCache = {};
          const dependencies = ${dependenciesMap};
          const usedImports = ${importsList};

          // Helper to load dependency
          const loadDependency = async (path) => {
            if (dependencyCache[path]) return;
            if (path === 'react' || path === 'react-dom' || path === 'react-dom/client' || path === 'react/jsx-runtime') return;

            // Handle CSS imports specially
            if (path.endsWith('.css')) {
               const parts = path.split('/');
               let pkgName = parts[0];
               if (path.startsWith('@') && parts.length > 1) {
                 pkgName = parts[0] + '/' + parts[1];
               }

               if (dependencies[pkgName]) {
                 const version = dependencies[pkgName];
                 const restPath = path.slice(pkgName.length);
                 const url = \`https://esm.sh/\${pkgName}@\${version}\${restPath}\`; 
                 
                 if (!document.querySelector(\`link[href="\${url}"]\`)) {
                   const link = document.createElement('link');
                   link.rel = 'stylesheet';
                   link.href = url;
                   document.head.appendChild(link);
                 }
                 // Cache empty object for CSS
                 dependencyCache[path] = {};
                 return;
               }
            }

            // Find matching dependency
            const pkgName = Object.keys(dependencies).find(dep => 
              path === dep || path.startsWith(dep + '/')
            );

            if (pkgName) {
              const version = dependencies[pkgName];
              const subPath = path.slice(pkgName.length);
              
              try {
                // Use esm.sh for dependencies
                // Added ?dev to ensure consistency with React imports
                const url = \`https://esm.sh/\${pkgName}@\${version}\${subPath}?external=react,react-dom&dev\`;
                console.log('[ReactLab] Fetching dependency:', url);
                const module = await import(url);
                dependencyCache[path] = module;
                console.log('[ReactLab] Successfully loaded:', path);
              } catch (e) {
                console.error(\`Failed to load dependency \${path}:\`, e);
                // We don't cache the error, so retries might happen, but effectively it's broken
              }
            }
          };

          // Pre-load dependencies and used imports
          const allImports = new Set([...Object.keys(dependencies), ...usedImports]);
          console.log('[ReactLab] Loading imports:', Array.from(allImports));
          
          await Promise.all(Array.from(allImports).map(loadDependency));
          
          console.log('[ReactLab] Dependency cache keys:', Object.keys(dependencyCache));
          
          // Define modules
          ${Object.entries(modules).map(([name, code]) => `
            modules['${name}'] = function(module, exports, require) {
              ${code}
            };
          `).join('\n')}

          // Custom require function
          function require(path) {
            // Handle built-ins
            if (path === 'react') return window.React;
            if (path === 'react-dom') return window.ReactDOM;
            if (path === 'react-dom/client') return window.ReactDOMClient;
            if (path === 'react/jsx-runtime') return window.JSXRuntime;
            
            // Check dependencies
            if (dependencyCache[path]) {
              const mod = dependencyCache[path];
              
              // Handle ESM module namespace
              // We create a new object and copy all properties
              const exported = {};
              
              // Copy named exports
              // Note: Module Namespace objects might need specific handling
              const descriptors = Object.getOwnPropertyDescriptors(mod);
              Object.defineProperties(exported, descriptors);
              
              // Handle default export for CJS interop
              if (mod.default && typeof mod.default === 'object') {
                const defaultDescriptors = Object.getOwnPropertyDescriptors(mod.default);
                Object.defineProperties(exported, defaultDescriptors);
              }
              
              // Ensure __esModule is true
              exported.__esModule = true;
              
              // Debug logging for react-icons
              if (path.includes('react-icons')) {
                console.log('[ReactLab] Loaded ' + path + ':', {
                  keys: Object.keys(exported).slice(0, 10), // Show first 10
                  hasFaRegHeart: 'FaRegHeart' in exported
                });
              }

              // Return a Proxy to warn about missing exports
               return new Proxy(exported, {
                 get(target, prop) {
                   if (prop in target) {
                     return target[prop];
                   }
                   
                   // Skip internal properties and common checks
                   if (typeof prop === 'string' && 
                       prop !== 'then' && 
                       prop !== 'default' && 
                       prop !== '__esModule' &&
                       !prop.startsWith('__')) {
                     console.warn('[ReactLab] Warning: Module "' + path + '" does not have export "' + prop + '".');
                   }
                   
                   return undefined;
                 }
               });
            }

            // Handle CSS imports from dependencies
            if (path.endsWith('.css')) {
              // Check if it's a local file (starts with ./ or no / at all and not in dependencies)
              // We assume local CSS is already injected via style tag, so we just return empty
              const isLocal = path.startsWith('./') || path.startsWith('../') || (!path.includes('/') && !dependencies[path]);
              if (isLocal) return {};

              const parts = path.split('/');
              let pkgName = parts[0];
              if (path.startsWith('@') && parts.length > 1) {
                pkgName = parts[0] + '/' + parts[1];
              }

              if (dependencies[pkgName]) {
                const version = dependencies[pkgName];
                // Construct URL: https://esm.sh/pkg@version/path/to/file.css
                // path is like "react-toastify/dist/ReactToastify.css"
                // we want "react-toastify@version/dist/ReactToastify.css"
                const restPath = path.slice(pkgName.length); // /dist/ReactToastify.css
                const url = \`https://esm.sh/\${pkgName}@\${version}\${restPath}\`; 
                
                if (!document.querySelector(\`link[href="\${url}"]\`)) {
                  const link = document.createElement('link');
                  link.rel = 'stylesheet';
                  link.href = url;
                  document.head.appendChild(link);
                }
                return {};
              }
            }

            // Normalize path (simple version)
            const cleanPath = path.replace(/^\\.\\//, '').replace(/\\.(js|jsx|ts|tsx)$/, '');
            
            // Try exact match first, then clean path
            const moduleKey = Object.keys(modules).find(k => 
              k === path || 
              k === cleanPath || 
              k.replace(/\\.(js|jsx|ts|tsx)$/, '') === cleanPath
            );
            
            if (!moduleKey) {
              // Check if it was a failed dependency
              if (Object.keys(dependencies).some(dep => path === dep || path.startsWith(dep + '/'))) {
                 throw new Error(\`Failed to resolve dependency '\${path}'. Check console for loading errors.\`);
              }
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
              const root = window.ReactDOMClient.createRoot(document.getElementById('root'));
              root.render(window.React.createElement(RootComponent));
            } else {
              throw new Error('App.jsx must default export a component');
            }
          }
          
        } catch (err) {
          window.parent.postMessage({ type: 'ERROR', message: err.message }, '*');
        }
        })();
      `;

      const iframe = iframeRef.current;
      if (!iframe) return;
      
      const htmlWithCss = html.replace('</head>', `<style>${cssContent}</style></head>`);
      iframe.srcdoc = htmlWithCss.replace('</body>', `<script>${script}</script></body>`);
      
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
