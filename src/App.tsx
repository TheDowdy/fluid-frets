import { Fretboard } from './components/Fretboard/Fretboard';
import { Toolbar } from './components/Toolbar/Toolbar';

export default function App() {
  return (
    <div className="app">
      <Toolbar />
      <main className="stage">
        <Fretboard />
      </main>
    </div>
  );
}
