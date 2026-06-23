import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HardwareIcon from '@mui/icons-material/Hardware';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { text: 'Техника', path: '/', icon: <HardwareIcon />, color: '#2e7d32' },
  { text: 'Расходники', path: '/consumables', icon: <InventoryIcon />, color: '#ed6c02' },
  { text: 'Картриджи', path: '/cartridges', icon: <LocalPrintshopIcon />, color: '#9c27b0' },
  { text: 'Справочники', path: '/catalogs', icon: <LibraryBooksIcon />, color: '#d32f2f' },
  { text: 'Ремонт', path: '/repairs', icon: <BuildIcon />, color: '#0288d1' },
  { text: 'Заправка', path: '/refueling', icon: <LocalGasStationIcon />, color: '#00897b' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuth, userName, logoutUser } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

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
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', flexGrow: 1, mt: 2 }}>
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

        <Divider />

        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Avatar sx={{ bgcolor: '#d32f2f', width: 32, height: 32 }}>
              {isAuth ? userName.charAt(0).toUpperCase() : 'Г'}
            </Avatar>
            <Typography variant="body2">
              {isAuth ? userName : 'Гость'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color={isAuth ? 'error' : 'primary'}
            size="small"
            onClick={isAuth ? handleLogout : handleLogin}
          >
            {isAuth ? 'Выйти' : 'Войти'}
          </Button>
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