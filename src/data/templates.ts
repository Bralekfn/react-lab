export interface File {
  name: string;
  language: string;
  content: string;
}

export interface Template {
  name: string;
  files: Record<string, File>;
  activeFile: string;
  dependencies?: Record<string, string>;
}

export const templates: Record<string, Template> = {
  counter: {
    name: "Counter",
    activeFile: "App.jsx",
    files: {
      "App.jsx": {
        name: "App.jsx",
        language: "javascript",
        content: `import React, { useState } from 'react';
import Button from './Button';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-4xl font-bold mb-8">React Counter</h1>
      <div className="flex gap-4">
        <Button onClick={() => setCount(c => c - 1)} variant="danger">
          Decrease
        </Button>
        <span className="text-4xl font-mono w-20 text-center">{count}</span>
        <Button onClick={() => setCount(c => c + 1)} variant="primary">
          Increase
        </Button>
      </div>
      <p className="mt-8 text-gray-500">
        Try editing Button.jsx to change the styles!
      </p>
    </div>
  );
}`
      },
      "Button.jsx": {
        name: "Button.jsx",
        language: "javascript",
        content: `import React from 'react';

export default function Button({ onClick, children, variant = 'primary' }) {
  const baseStyles = "px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg active:scale-95";
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 hover:shadow-blue-500/20",
    danger: "bg-red-500 hover:bg-red-600 hover:shadow-red-500/20"
  };

  return (
    <button
      onClick={onClick}
      className={\`\${baseStyles} \${variants[variant]}\`}
    >
      {children}
    </button>
  );
}`
      }
    }
  },
  card: {
    name: "Product Card",
    activeFile: "App.jsx",
    files: {
      "index.js": {
        name: "index.js",
        language: "javascript",
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      "App.jsx": {
        name: "App.jsx",
        language: "javascript",
        content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-w-sm w-full transition-all hover:-translate-y-1 hover:shadow-2xl">
        <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500" />
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                Abstract Art
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Digital Collection
              </p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
              New
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Experience the fusion of color and emotion in this unique digital masterpiece. Perfect for modern spaces.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              $129
            </span>
            <button className="px-5 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`
      }
    }
  },
  list: {
    name: "Confetti",
    activeFile: "App.jsx",
    dependencies: {
      "js-confetti": "latest"
    },
    files: {
      "index.js": {
        name: "index.js",
        language: "javascript",
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      "App.jsx": {
        name: "App.jsx",
        language: "javascript",
        content: `import React, { useRef, useState } from "react"; 
import Confetti from "js-confetti"; 
import "./style.css"; 

const confetti = new Confetti(); 

const App = () => { 
  const [count, setCount] = useState(0); 

  const handleClick = () => { 
    confetti.addConfetti(); 
    setCount((c) => c + 1); 
  }; 

  return ( 
    <button className="btn" onClick={handleClick}> 
      <span role="img" aria-label="react-emoji"> 
        ⚛️ 
      </span>{" "} 
      {count} 
    </button> 
  ); 
}; 

export default App;`
      },
      "style.css": {
        name: "style.css",
        language: "css",
        content: `/* style.css */ 

body { 
  font-family: 'Arial', sans-serif; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  margin: 0; 
  background-color: #282c34; 
  color: white; 
} 

.btn { 
  background-color: #61dafb; 
  color: #282c34; 
  font-size: 1.5rem; 
  padding: 20px 40px; 
  border: none; 
  border-radius: 50px; 
  cursor: pointer; 
  transition: all 0.3s ease-in-out; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
} 

.btn:hover { 
  background-color: #4fa3f7; 
  transform: scale(1.05); 
} 

.btn:active { 
  background-color: #3498db; 
} 

.btn span { 
  font-size: 1.8rem; 
}`
      }
    }
  }
};
