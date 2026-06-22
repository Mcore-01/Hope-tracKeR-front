import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from './components/MainLayout';
import CatalogPage from './pages/CatalogPage';
import DevicesTable from './components/DevicesTable';

function Dashboard() { return <div>Дашборд</div>; }
function Consumables() { return <div>Расходники</div>; }
function Cartridges() { return <div>Картриджи</div>; }
function Repairs() { return <div>Ремонт</div>; }
function Refueling() { return <div>Заправка</div>; }

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<DevicesTable />} />
          <Route path="consumables" element={<Consumables />} />
          <Route path="cartridges" element={<Cartridges />} />
          <Route path="catalogs" element={<CatalogPage />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="refueling" element={<Refueling />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;