import { PlaygroundProvider } from './contexts/PlaygroundContext';
import { Layout } from './components/Layout';

function App() {
  return (
    <PlaygroundProvider>
      <Layout />
    </PlaygroundProvider>
  );
}

export default App;
