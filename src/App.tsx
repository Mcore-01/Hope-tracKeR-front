import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from './pages/MainLayout';
import CatalogPage from './pages/CatalogPage';
import DevicesTable from './components/devices/DevicesTable';
import RepairsTable from './components/devices/RepairsTable';
import LoginPage from './pages/LoginPage';
import ConsumablesTable from './components/consumables/ConsumablesTable';
import CartridgesTable from './components/cartridges/CartridgesTable';
import RefillsTable from './components/cartridges/RefillsTable';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DevicesTable />} />
          <Route path="consumables" element={<ConsumablesTable />} />
          <Route path="cartridges" element={<CartridgesTable />} />
          <Route path="catalogs" element={<CatalogPage />} />
          <Route path="repairs" element={<RepairsTable />} />
          <Route path="refueling" element={<RefillsTable />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;