import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import BrandsCatalog from '../components/BrandsCatalog';
import EmployeesCatalog from '../components/EmployeesCatalog';
import AddressesCatalog from '../components/AddressesCatalog';
import CategoriesCatalog from '../components/CategoriesCatalog';

export default function CatalogPage() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleChange} aria-label="справочники">
          <Tab label="Бренды" />
          <Tab label="Сотрудники" />
          <Tab label="Адреса" />
          <Tab label="Категории" />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 && <BrandsCatalog />}
        {tabIndex === 1 && <EmployeesCatalog />}
        {tabIndex === 2 && <AddressesCatalog />}
        {tabIndex === 3 && <CategoriesCatalog />}
      </Box>
    </Box>
  );
}