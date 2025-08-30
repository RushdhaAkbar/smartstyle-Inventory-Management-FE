
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { store } from "./lib/store";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Inventory from './routes/inventory';
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
  
   <Routes>
           <Route path="/" element={<Inventory />} />
         </Routes>
  
  </BrowserRouter>
  </Provider>
)
