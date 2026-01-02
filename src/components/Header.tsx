import { useState } from 'react';
import { usePlayground } from '../contexts/PlaygroundContext';
import { useToast } from '../contexts/ToastContext';
import { Moon, Sun, RefreshCw, Github, Menu, Share2, Loader2 } from 'lucide-react';
import { saveSnippet } from '../lib/firebase';

export function Header() {
  const { 
    theme, 
    toggleTheme, 
    refreshPreview,
    isSidebarOpen,
    setIsSidebarOpen,
    files
  } = usePlayground();
  
  const { showToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shortId = await saveSnippet(files);
      const url = `${window.location.origin}/s/${shortId}`;
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to share project:', error);
      showToast('Failed to generate share link', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-950 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-900 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <img src="/ReactLab.webp" alt="ReactLab Logo" className="w-8 h-8 rounded-lg" />
        <h1 className="text-2xl font-bold text-black dark:text-white hidden sm:block">
          ReactLab
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPreview}
            className="p-2.5 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="p-2.5 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Share Project"
          >
            {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
          </button>

          <a
            href="https://github.com/Bralekfn/react-lab"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="View on GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
