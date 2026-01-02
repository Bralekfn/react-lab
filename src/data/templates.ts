export interface File {
  name: string;
  language: string;
  content: string;
}

export interface Template {
  name: string;
  files: Record<string, File>;
  activeFile: string;
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
    name: "Todo List",
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
        content: `import React, { useState } from 'react';
import TodoItem from './TodoItem';

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: true },
    { id: 2, text: 'Build a playground', completed: false },
    { id: 3, text: 'Share with friends', completed: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 bg-indigo-600">
          <h1 className="text-2xl font-bold text-white mb-2">My Tasks</h1>
          <p className="text-indigo-200 text-sm">
            {todos.filter(t => !t.completed).length} items remaining
          </p>
        </div>
        
        <div className="p-4">
          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </form>

          <div className="space-y-2">
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={() => toggleTodo(todo.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`
      },
      "TodoItem.jsx": {
        name: "TodoItem.jsx",
        language: "javascript",
        content: `import React from 'react';

export default function TodoItem({ todo, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={\`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors \${
        todo.completed 
          ? 'bg-gray-50 dark:bg-gray-800/50' 
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
      }\`}
    >
      <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${
        todo.completed
          ? 'border-green-500 bg-green-500'
          : 'border-gray-300 dark:border-gray-600'
      }\`}>
        {todo.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={\`flex-1 \${
        todo.completed 
          ? 'text-gray-400 line-through' 
          : 'text-gray-700 dark:text-gray-200'
      }\`}>
        {todo.text}
      </span>
    </div>
  );
}`
      }
    }
  }
};
