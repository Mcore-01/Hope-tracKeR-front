import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from './pages/MainLayout';
import CatalogPage from './pages/CatalogPage';
import DevicesTable from './components/devices/DevicesTable';
import RepairsTable from './components/devices/RepairsTable';
import LoginPage from './pages/LoginPage';

function Consumables() { return <div>Расходники</div>; }
function Cartridges() { return <div>Картриджи</div>; }
function Refueling() { return <div>Заправка</div>; }

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DevicesTable />} />
          <Route path="consumables" element={<Consumables />} />
          <Route path="cartridges" element={<Cartridges />} />
          <Route path="catalogs" element={<CatalogPage />} />
          <Route path="repairs" element={<RepairsTable />} />
          <Route path="refueling" element={<Refueling />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;