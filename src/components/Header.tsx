import { useState } from 'react';
import { usePlayground } from '../contexts/PlaygroundContext';
import { useToast } from '../contexts/ToastContext';
import { Moon, Sun, RefreshCw, Github, Menu, Share2, Loader2 } from 'lucide-react';
import { saveSnippet } from '../lib/firebase';
import { compressFiles } from '../utils/url-compression';

const RATE_LIMIT_MS = 30000; // 30 seconds

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
      const currentCompressed = compressFiles(files);
      
      // Check for deduplication
      const lastCode = localStorage.getItem('react-lab-last-share-code');
      const lastId = localStorage.getItem('react-lab-last-share-id');
      
      if (currentCompressed === lastCode && lastId) {
        const url = `${window.location.origin}/s/${lastId}`;
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
        return;
      }

      // Check rate limit
      const lastTime = parseInt(localStorage.getItem('react-lab-last-share-time') || '0');
      const timeSinceLastShare = Date.now() - lastTime;
      
      if (timeSinceLastShare < RATE_LIMIT_MS) {
        const remainingSeconds = Math.ceil((RATE_LIMIT_MS - timeSinceLastShare) / 1000);
        showToast(`Please wait ${remainingSeconds} seconds before creating a new link.`, 'error');
        return;
      }

      const shortId = await saveSnippet(files);
      
      // Update local storage
      localStorage.setItem('react-lab-last-share-code', currentCompressed);
      localStorage.setItem('react-lab-last-share-id', shortId);
      localStorage.setItem('react-lab-last-share-time', Date.now().toString());

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
