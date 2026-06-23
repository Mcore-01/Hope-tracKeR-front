import { useEffect, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Alert, Snackbar } from '@mui/material';
import { getDevicesByFilter, generateRepairAct } from '../../services/DeviceService';
import type { DeviceResponse } from '../../models/DeviceResponse';
import CompleteRepairDialog from './CompleteRepairDialog';
import { useAuth } from '../../hooks/useAuth';

export default function RepairsTable() {
  const { isAuth } = useAuth();
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeDeviceId, setCompleteDeviceId] = useState<number | null>(null);

  const loadRepairs = () => {
    getDevicesByFilter({ status: 'Repair' })
      .then(setDevices)
      .catch((error) => {
        console.error('Ошибка загрузки ремонтов:', error);
        setError('Не удалось загрузить список ремонтов');
      });
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const handleGenerateAct = async (deviceId: number) => {
    try {
      const blob = await generateRepairAct(deviceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Акт_ремонта_${deviceId}.docx`;
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
    { field: 'serialNumber', headerName: 'Серийный номер', width: 150 },
    {
      field: 'addedDate',
      headerName: 'Дата добавления',
      width: 180,
      valueGetter: (_, row: DeviceResponse) => new Date(row.addedDate).toLocaleDateString('ru-RU'),
    },
    { field: 'brand', headerName: 'Бренд', width: 150 },
    { field: 'category', headerName: 'Категория', width: 150 },
    { field: 'address', headerName: 'Адрес', width: 200 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 250,
      renderCell: (params) => {
        const device = params.row as DeviceResponse;
        return (
          <Box>
            {isAuth && (
              <Button
                size="small"
                color="success"
                onClick={() => {
                  setCompleteDeviceId(device.id);
                  setCompleteDialogOpen(true);
                }}
              >
                Завершить ремонт
              </Button>
            )}
            <Button
              size="small"
              color="info"
              onClick={() => handleGenerateAct(device.id)}
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
          rows={devices}
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

      <CompleteRepairDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        deviceId={completeDeviceId!}
        onSuccess={loadRepairs}
      />
    </>
  );
}