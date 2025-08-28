import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Inventory from './routes/inventory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inventory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;