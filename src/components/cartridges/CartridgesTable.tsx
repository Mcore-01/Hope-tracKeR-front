import { useEffect, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Chip, Alert, Snackbar, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { getCartridgesByFilter, createCartridge, updateCartridge, deleteCartridge, exportCartridgesToExcel, startRefill } from '../../services/CartridgeService';
import type { CartridgeResponse } from '../../models/CartridgeResponse';
import { CartridgeStatusLabels } from '../../enums/CartridgeStatus';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import CartridgeFormDialog from './CartridgeFormDialog';
import StartRefillDialog from './StartRefillDialog';
import type { CartridgeRequest } from '../../models/CartridgeRequest';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../common/ConfirmDialog';

export default function CartridgesTable() {
  const { isAuth } = useAuth();
  const [cartridges, setCartridges] = useState<CartridgeResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCartridge, setEditingCartridge] = useState<CartridgeResponse | null>(null);
  const [startRefillDialogOpen, setStartRefillDialogOpen] = useState(false);
  const [startRefillId, setStartRefillId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCartridges = () => {
    getCartridgesByFilter({})
      .then(setCartridges)
      .catch((error) => {
        console.error('Ошибка загрузки картриджей:', error);
        setError('Не удалось загрузить картриджи');
      });
  };

  useEffect(() => {
    loadCartridges();
  }, []);

  const handleAdd = () => {
    setEditingCartridge(null);
    setDialogOpen(true);
  };

  const handleEdit = (cartridge: CartridgeResponse) => {
    setEditingCartridge(cartridge);
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
      await deleteCartridge(deleteId);
      loadCartridges();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setError('Не удалось удалить картридж');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleStartRefill = (id: number) => {
    setStartRefillId(id);
    setStartRefillDialogOpen(true);
  };

  const handleStartRefillConfirm = async (addressId: number, startDate: string) => {
    if (startRefillId === null) return;
    try {
      await startRefill({
        itemId: startRefillId,
        addressId: addressId,
        userId: Number(localStorage.getItem('userId')) || 1,
        startDate: new Date(startDate).toISOString(),
      });
      loadCartridges();
      setStartRefillDialogOpen(false);
      setStartRefillId(null);
    } catch (error) {
      console.error('Ошибка отправки на заправку:', error);
      setError('Не удалось отправить картридж на заправку');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCartridgesToExcel({});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Картриджи.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      setError('Не удалось экспортировать данные');
    }
  };

  const handleSave = async (cartridgeData: CartridgeRequest) => {
    try {
      if (editingCartridge) {
        await updateCartridge(cartridgeData);
      } else {
        await createCartridge(cartridgeData);
      }
      loadCartridges();
      setDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError('Не удалось сохранить картридж');
      throw error;
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Наименование', width: 200 },
    { field: 'printerModel', headerName: 'Модель принтера', width: 180 },
    {
      field: 'status',
      headerName: 'Статус',
      width: 160,
      renderCell: (params) => {
        const status = params.value as string;
        const label = CartridgeStatusLabels[status as keyof typeof CartridgeStatusLabels] || status;
        const colorMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
          InStock: 'success',
          Installed: 'info',
          Empty: 'warning',
          Refilling: 'warning',
          WriteOff: 'default',
        };
        return (
          <Chip
            label={label}
            color={colorMap[status] || 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    { field: 'brand', headerName: 'Бренд', width: 150 },
    { field: 'address', headerName: 'Адрес', width: 200 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 250,
      renderCell: (params) => {
        const cartridge = params.row as CartridgeResponse;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {isAuth && (
              <>
                <Tooltip title="Изменить">
                  <IconButton size="small" onClick={() => handleEdit(cartridge)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(cartridge.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {(cartridge.status === 'InStock' || cartridge.status === 'Empty') && (
                  <Tooltip title="Отправить на заправку">
                    <IconButton size="small" color="warning" onClick={() => handleStartRefill(cartridge.id)}>
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
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
        <Typography variant="h5" component="h2">Управление картриджами</Typography>
        <Box>
          {isAuth && (
            <Button variant="contained" onClick={handleAdd} sx={{ mr: 1 }}>
              Добавить картридж
            </Button>
          )}
          <Button variant="outlined" onClick={handleExport}>
            Экспорт в Excel
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
        <DataGrid
          rows={cartridges}
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

      <CartridgeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={editingCartridge}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить этот картридж?"
        confirmText="Удалить"
        confirmColor="error"
        loading={deleting}
      />

      <StartRefillDialog
        open={startRefillDialogOpen}
        onClose={() => setStartRefillDialogOpen(false)}
        onConfirm={handleStartRefillConfirm}
      />
    </>
  );
}