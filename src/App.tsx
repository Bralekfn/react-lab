import { PlaygroundProvider } from './contexts/PlaygroundContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';

function App() {
  return (
    <ToastProvider>
      <PlaygroundProvider>
        <Layout />
      </PlaygroundProvider>
    </ToastProvider>
  );
}

export default App;
