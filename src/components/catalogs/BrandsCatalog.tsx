import type { Brand } from '../../models/Brand';
import { useCallback, useEffect, useState } from 'react';
import { createBrand, getAllBrands, removeBrand, updateBrand } from '../../services/BrandService';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField, Typography, IconButton, Tooltip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../hooks/useAuth';

export default function BrandsCatalog() {
  const { isAuth } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const LabelTable: string = 'Бренды';

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning'>('error');

  const showNotification = useCallback((message: string, severity: 'error' | 'warning' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const loadBrands = useCallback(() => {
    getAllBrands()
      .then(data => setBrands(data))
      .catch(error => {
        console.error('Ошибка загрузки брендов:', error);
        showNotification('Не удалось загрузить бренды', 'error');
      });
  }, [showNotification]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setName(brand.name);
    } else {
      setEditingBrand(null);
      setName('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBrand(null);
    setName('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showNotification('Название не может быть пустым', 'warning');
      return;
    }

    try {
      if (editingBrand) {
        await updateBrand({ ...editingBrand, name: name.trim() });
      } else {
        await createBrand({ name: name.trim() });
      }
      handleCloseDialog();
      loadBrands();
    } catch (error) {
      console.error('Ошибка сохранения бренда:', error);
      showNotification('Не удалось сохранить бренд', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Уверены что хотите удалить бренд?')) return;
    try {
      await removeBrand(id);
      loadBrands();
    } catch (error) {
      console.error('Ошибка удаления бренда:', error);
      showNotification('Не удалось удалить бренд', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Название', width: 200 },
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
                <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
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
          {LabelTable}
        </Typography>
        {isAuth && (
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Добавить
          </Button>
        )}
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', mt: 2 }}>
        <DataGrid
          rows={brands}
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
        <DialogTitle>{editingBrand ? 'Редактировать бренд' : 'Добавить бренд'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
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
    </>
  );
}