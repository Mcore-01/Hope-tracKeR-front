import { useCallback, useEffect, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField, Typography, IconButton, Tooltip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Address } from '../../models/Address';
import { createAddress, getAllAddresses, removeAddress, updateAddress } from '../../services/AddressService';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../common/ConfirmDialog';

export default function AddressesCatalog() {
  const { isAuth } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [branch, setBranch] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState<number | ''>('');
  const [room, setRoom] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning'>('error');

  const showNotification = useCallback((message: string, severity: 'error' | 'warning' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const loadAddresses = useCallback(() => {
    getAllAddresses()
      .then(data => setAddresses(data))
      .catch(error => {
        console.error('Ошибка загрузки адресов:', error);
        showNotification('Не удалось загрузить адреса', 'error');
      });
  }, [showNotification]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setBranch(address.branch);
      setBuilding(address.building);
      setFloor(address.floor);
      setRoom(address.room);
    } else {
      setEditingAddress(null);
      setBranch('');
      setBuilding('');
      setFloor('');
      setRoom('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
    setBranch('');
    setBuilding('');
    setFloor('');
    setRoom('');
  };

  const handleSave = async () => {
    if (!branch.trim() || !building.trim() || floor === '' || !room.trim()) {
      showNotification('Все поля должны быть заполнены', 'warning');
      return;
    }

    try {
      const addressData = {
        branch: branch.trim(),
        building: building.trim(),
        floor: Number(floor),
        room: room.trim(),
      };

      if (editingAddress) {
        await updateAddress({ ...editingAddress, ...addressData });
      } else {
        await createAddress(addressData);
      }
      handleCloseDialog();
      loadAddresses();
    } catch (error) {
      console.error('Ошибка сохранения адреса:', error);
      showNotification('Не удалось сохранить адрес', 'error');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await removeAddress(deleteId);
      loadAddresses();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Ошибка удаления адреса:', error);
      showNotification('Не удалось удалить адрес', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'branch', headerName: 'Филиал', width: 150 },
    { field: 'building', headerName: 'Здание', width: 150 },
    { field: 'floor', headerName: 'Этаж', width: 100 },
    { field: 'room', headerName: 'Комната', width: 150 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {isAuth && (
            <>
              <Tooltip title="Изменить">
                <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Адреса
        </Typography>
        {isAuth && (
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Добавить
          </Button>
        )}
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', mt: 2 }}>
        <DataGrid
          rows={addresses}
          columns={columns}
          showToolbar
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingAddress ? 'Редактировать адрес' : 'Добавить адрес'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Филиал"
            fullWidth
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Здание"
            fullWidth
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Этаж"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
            value={floor}
            onChange={(e) => setFloor(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <TextField
            margin="dense"
            label="Комната"
            fullWidth
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить этот адрес?"
        confirmText="Удалить"
        confirmColor="error"
        loading={deleting}
      />
    </>
  );
}