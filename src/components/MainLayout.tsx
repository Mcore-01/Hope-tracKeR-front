import { Link, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HardwareIcon from '@mui/icons-material/Hardware';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

const menuItems = [
  { text: 'Дашборд', path: '/', icon: <DashboardIcon />, color: '#1976d2' },
  { text: 'Техника', path: '/devices', icon: <HardwareIcon />, color: '#2e7d32' },
  { text: 'Расходники', path: '/consumables', icon: <InventoryIcon />, color: '#ed6c02' },
  { text: 'Картриджи', path: '/cartridges', icon: <LocalPrintshopIcon />, color: '#9c27b0' },
  { text: 'Справочники', path: '/references', icon: <LibraryBooksIcon />, color: '#d32f2f' },
  { text: 'Ремонт', path: '/repairs', icon: <BuildIcon />, color: '#0288d1' },
  { text: 'Заправка', path: '/refueling', icon: <LocalGasStationIcon />, color: '#00897b' },
];

export default function MainLayout() {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                        '&:hover': {
                          backgroundColor: '#b71c1c',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                        '& .MuiListItemIcon-root': {
                          color: 'black',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? 'white' : item.color }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}