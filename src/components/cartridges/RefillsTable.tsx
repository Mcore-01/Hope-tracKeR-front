import { useEffect, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Alert, Snackbar } from '@mui/material';
import { getCartridgesByFilter, completeRefill, generateRefillAct } from '../../services/CartridgeService';
import type { CartridgeResponse } from '../../models/CartridgeResponse';
import { CartridgeStatusLabels } from '../../enums/CartridgeStatus';
import CompleteRefillDialog from './CompleteRefillDialog';
import { useAuth } from '../../hooks/useAuth';

export default function RefillsTable() {
  const { isAuth } = useAuth();
  const [cartridges, setCartridges] = useState<CartridgeResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeRefillId, setCompleteRefillId] = useState<number | null>(null);

  const loadRefills = () => {
    getCartridgesByFilter({ status: 'Refilling' })
      .then(setCartridges)
      .catch((error) => {
        console.error('Ошибка загрузки заправок:', error);
        setError('Не удалось загрузить список заправок');
      });
  };

  useEffect(() => {
    loadRefills();
  }, []);

  const handleCompleteRefill = async (itemId: number, addressId: number, endDate: string) => {
    try {
      await completeRefill({
        itemId: itemId,
        addressId: addressId,
        userId: Number(localStorage.getItem('userId')) || 1,
        endDate: new Date(endDate).toISOString(),
      });
      loadRefills();
    } catch (error) {
      console.error('Ошибка завершения заправки:', error);
      setError('Не удалось завершить заправку');
    }
  };

  const handleGenerateAct = async (cartridgeId: number) => {
    try {
      const blob = await generateRefillAct(cartridgeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Акт_заправки_${cartridgeId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка генерации акта:', error);
      setError('Не удалось сгенерировать акт');
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
      valueGetter: (_, row: CartridgeResponse) => {
        return CartridgeStatusLabels[row.status as keyof typeof CartridgeStatusLabels] || row.status;
      },
    },
    { field: 'brand', headerName: 'Бренд', width: 150 },
    { field: 'address', headerName: 'Адрес', width: 200 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 300,
      renderCell: (params) => {
        const cartridge = params.row as CartridgeResponse;
        return (
          <Box>
            {isAuth && cartridge.status === 'Refilling' && (
              <Button
                size="small"
                color="success"
                onClick={() => {
                  setCompleteRefillId(cartridge.id);
                  setCompleteDialogOpen(true);
                }}
              >
                Завершить заправку
              </Button>
            )}
            <Button
              size="small"
              color="info"
              onClick={() => handleGenerateAct(cartridge.id)}
            >
              Акт
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <>
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

      <CompleteRefillDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onConfirm={handleCompleteRefill}
        cartridgeId={completeRefillId}
      />
    </>
  );
}