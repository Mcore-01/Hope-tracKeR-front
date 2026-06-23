import { useEffect, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Alert, Snackbar, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { getConsumablesByFilter, deleteConsumable, exportConsumablesToExcel, increaseQuantity, decreaseQuantity, updateConsumable, createConsumable } from '../../services/ConsumableService';
import type { ConsumableResponse } from '../../models/ConsumableResponse';
import ConsumableFormDialog from './ConsumableFormDialog';
import QuantityDialog from './QuantityDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import type { ConsumableRequest } from '../../models/ConsumableRequest';
import { useAuth } from '../../hooks/useAuth';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function ConsumablesTable() {
  const { isAuth } = useAuth();
  const [consumables, setConsumables] = useState<ConsumableResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConsumable, setEditingConsumable] = useState<ConsumableResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [increaseDialogOpen, setIncreaseDialogOpen] = useState(false);
  const [increaseId, setIncreaseId] = useState<number | null>(null);
  const [decreaseDialogOpen, setDecreaseDialogOpen] = useState(false);
  const [decreaseId, setDecreaseId] = useState<number | null>(null);

  const loadConsumables = () => {
    getConsumablesByFilter({})
      .then(setConsumables)
      .catch((error) => {
        console.error('Ошибка загрузки расходников:', error);
        setError('Не удалось загрузить расходники');
      });
  };

  useEffect(() => {
    loadConsumables();
  }, []);

  const handleAdd = () => {
    setEditingConsumable(null);
    setDialogOpen(true);
  };

  const handleEdit = (consumable: ConsumableResponse) => {
    setEditingConsumable(consumable);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await deleteConsumable(deleteId);
      loadConsumables();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setError('Не удалось удалить расходник');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleIncreaseClick = (id: number) => {
    setIncreaseId(id);
    setIncreaseDialogOpen(true);
  };

  const handleIncreaseConfirm = async (amount: number) => {
    if (increaseId === null) return;
    try {
      await increaseQuantity(increaseId, amount);
      loadConsumables();
      setIncreaseDialogOpen(false);
      setIncreaseId(null);
    } catch (error) {
      console.error('Ошибка увеличения:', error);
      setError('Не удалось увеличить количество');
    }
  };

  const handleDecreaseClick = (id: number) => {
    setDecreaseId(id);
    setDecreaseDialogOpen(true);
  };

  const handleDecreaseConfirm = async (amount: number) => {
    if (decreaseId === null) return;
    try {
      await decreaseQuantity(decreaseId, amount);
      loadConsumables();
      setDecreaseDialogOpen(false);
      setDecreaseId(null);
    } catch (error) {
      console.error('Ошибка уменьшения:', error);
      setError('Не удалось уменьшить количество');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportConsumablesToExcel({});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Расходники.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      setError('Не удалось экспортировать данные');
    }
  };

  const handleSave = async (consumableData: ConsumableRequest) => {
    try {
      if (editingConsumable) {
        await updateConsumable(consumableData);
      } else {
        await createConsumable(consumableData);
      }
      loadConsumables();
      setDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError('Не удалось сохранить расходник');
      throw error;
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Наименование', width: 200 },
    { field: 'quantity', headerName: 'Количество', width: 120 },
    { field: 'brand', headerName: 'Бренд', width: 150 },
    { field: 'address', headerName: 'Адрес', width: 200 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 280,
      renderCell: (params) => {
        const consumable = params.row as ConsumableResponse;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {isAuth && (
              <>
                <Tooltip title="Изменить">
                  <IconButton size="small" onClick={() => handleEdit(consumable)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(consumable.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Увеличить количество">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleIncreaseClick(consumable.id)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Уменьшить количество">
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleDecreaseClick(consumable.id)}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">Управление расходниками</Typography>
        <Box>
          {isAuth && (
            <Button variant="contained" onClick={handleAdd} sx={{ mr: 1 }}>
              Добавить расходник
            </Button>
          )}
          <Button variant="outlined" onClick={handleExport}>
            Экспорт в Excel
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
        <DataGrid
          rows={consumables}
          columns={columns}
          showToolbar
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10]}
        />
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <ConsumableFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={editingConsumable}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить этот расходник?"
        confirmText="Удалить"
        confirmColor="error"
        loading={deleting}
      />

      <QuantityDialog
        open={increaseDialogOpen}
        onClose={() => setIncreaseDialogOpen(false)}
        onConfirm={handleIncreaseConfirm}
        title="Увеличить количество"
        buttonText="Добавить"
        buttonColor="success"
      />

      <QuantityDialog
        open={decreaseDialogOpen}
        onClose={() => setDecreaseDialogOpen(false)}
        onConfirm={handleDecreaseConfirm}
        title="Уменьшить количество"
        buttonText="Списать"
        buttonColor="warning"
      />
    </>
  );
}