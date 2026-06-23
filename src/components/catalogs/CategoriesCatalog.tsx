import { useCallback, useEffect, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField, Typography, IconButton, Tooltip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Category } from '../../models/Category';
import { createCategory, getAllCategories, removeCategory, updateCategory } from '../../services/CategoryService';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../common/ConfirmDialog';

export default function CategoriesCatalog() {
  const { isAuth } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
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

  const loadCategories = useCallback(() => {
    getAllCategories()
      .then(data => setCategories(data))
      .catch(error => {
        console.error('Ошибка загрузки категорий:', error);
        showNotification('Не удалось загрузить категории', 'error');
      });
  }, [showNotification]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setName('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showNotification('Название не может быть пустым', 'warning');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({ ...editingCategory, name: name.trim() });
      } else {
        await createCategory({ name: name.trim() });
      }
      handleCloseDialog();
      loadCategories();
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
      showNotification('Не удалось сохранить категорию', 'error');
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
      await removeCategory(deleteId);
      loadCategories();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
      showNotification('Не удалось удалить категорию', 'error');
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
          Категории
        </Typography>
        {isAuth && (
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Добавить
          </Button>
        )}
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', mt: 2 }}>
        <DataGrid
          rows={categories}
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
        <DialogTitle>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить эту категорию?"
        confirmText="Удалить"
        confirmColor="error"
        loading={deleting}
      />
    </>
  );
}