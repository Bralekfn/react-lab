import { useState, useRef, useEffect } from 'react';
import { usePlayground } from '../contexts/PlaygroundContext';
import { X, Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'success';
  content: string;
}

export function Terminal({ onClose }: { onClose: () => void }) {
  const { addDependency, removeDependency, dependencies } = usePlayground();
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'ReactLab Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" to see available commands.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input when terminal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = async (cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    setHistory(prev => [...prev, { type: 'command', content: cmd }]);

    switch (command) {
      case 'npm':
        if (args[0] === 'install' || args[0] === 'i') {
          const packages = args.slice(1);
          if (packages.length === 0) {
            setHistory(prev => [...prev, { type: 'error', content: 'Usage: npm install <package_name>' }]);
            return;
          }

          for (const pkg of packages) {
            // Basic parsing for version: pkg@version
            const [name, version] = pkg.split('@');
            const ver = version || 'latest';
            
            setHistory(prev => [...prev, { type: 'output', content: `Installing ${name}@${ver}...` }]);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            addDependency(name, ver);
            setHistory(prev => [...prev, { type: 'success', content: `+ ${name}@${ver}` }]);
          }
          setHistory(prev => [...prev, { type: 'success', content: `Added ${packages.length} packages` }]);
        } else if (args[0] === 'uninstall' || args[0] === 'remove' || args[0] === 'rm') {
          const packages = args.slice(1);
          if (packages.length === 0) {
            setHistory(prev => [...prev, { type: 'error', content: 'Usage: npm uninstall <package_name>' }]);
            return;
          }
          
          for (const pkg of packages) {
            removeDependency(pkg);
            setHistory(prev => [...prev, { type: 'success', content: `Removed ${pkg}` }]);
          }
        } else {
           setHistory(prev => [...prev, { type: 'error', content: `Unknown npm command: ${args[0]}` }]);
        }
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        break;

      case 'help':
        setHistory(prev => [...prev, { 
          type: 'output', 
          content: `Available commands:
  npm install <pkg>   Install a package
  npm uninstall <pkg> Remove a package
  list                List installed packages
  clear               Clear terminal
  help                Show this help message`
        }]);
        break;

      case 'list':
      case 'ls':
        if (Object.keys(dependencies).length === 0) {
          setHistory(prev => [...prev, { type: 'output', content: 'No packages installed' }]);
        } else {
          const depsList = Object.entries(dependencies)
            .map(([name, ver]) => `${name}@${ver}`)
            .join('\n');
          setHistory(prev => [...prev, { type: 'output', content: depsList }]);
        }
        break;

      case '':
        break;

      default:
        setHistory(prev => [...prev, { type: 'error', content: `Command not found: ${command}` }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm border-t border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <span className="font-semibold">Terminal</span>
        </div>
        <button onClick={onClose} className="hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1" onClick={() => inputRef.current?.focus()}>
        {history.map((line, i) => (
          <div key={i} className={`
            ${line.type === 'command' ? 'text-white mt-2 font-bold' : ''}
            ${line.type === 'error' ? 'text-red-400' : ''}
            ${line.type === 'success' ? 'text-green-400' : ''}
            ${line.type === 'output' ? 'text-gray-300' : ''}
          `}>
            {line.type === 'command' && <span className="mr-2 text-blue-400">$</span>}
            <span className="whitespace-pre-wrap">{line.content}</span>
          </div>
        ))}
        
        <div className="flex items-center mt-2">
          <span className="mr-2 text-blue-400 font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
