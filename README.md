# ReactLab ⚛️

A modern, fast, and visually appealing React Playground / Component Sandbox. Write React code in real-time, manage dependencies, and see live previews instantly.

![ReactLab Preview](public/preview.png)

## Features

### � Core Experience
- **Live Preview**: Instant feedback as you type with hot reloading.
- **Monaco Editor**: VS Code-like editing experience with syntax highlighting, IntelliSense, and minimap.
- **Multi-file Support**: Create, edit, and delete multiple components and files (JS/JSX/TS/TSX).
- **Modern UI**: Clean, resizable split-pane layout with persistent Dark/Light mode support.

### 📦 Dependency Management
- **NPM Packages**: Easily add external libraries (e.g., `react-toastify`, `lodash`, `framer-motion`) directly from the UI.
- **CSS Injection**: Automatic support for package CSS files (e.g., `import 'react-toastify/dist/ReactToastify.css'`).
- **Smart Caching**: Dependencies are cached for faster load times.

### 🛠 Tools & Developer Experience
- **Integrated Terminal**: Built-in console for viewing logs, warnings, and errors.
- **Error Overlay**: Clear, descriptive error messages for both build-time and runtime issues.
- **Templates**: Jumpstart your coding with pre-built templates (Counter, Product Card, Todo List).
- **Code Sharing**: Share your snippets with others via unique URLs.
- **Babel Standalone**: In-browser compilation supporting modern JavaScript and React features.
- **Tailwind CSS**: Built-in support for utility-first styling without configuration.

### 📱 Responsive Design
- **Mobile Optimized**: Dedicated mobile view with tabbed navigation (Editor, Preview, Terminal).
- **Desktop Enhanced**: Quick access tools and keyboard shortcuts.

## Tech Stack

- **Framework**: React 18 + Vite
- **Editor**: @monaco-editor/react
- **Styling**: Tailwind CSS
- **Compiler**: @babel/standalone
- **Package Resolution**: esm.sh
- **Icons**: Lucide React
- **State Management**: React Context API
- **Backend/Sharing**: Firebase

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bralekfn/react-lab.git
   cd react-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Usage

- **Manage Files**: Use the file explorer sidebar to create new components.
- **Add Dependencies**: Click the "Dependencies" section in the sidebar to search and add npm packages.
- **View Output**: Toggle the Terminal panel to debug your application.
- **Share**: Click the Share button to generate a unique link for your code.

## Credits

- **Confetti Template**: Inspired by and based on work by [AyloSrd](https://github.com/AyloSrd).

## License

MIT License

Copyright (c) 2026 Bralekfn