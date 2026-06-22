import { useEffect, useState, useMemo } from 'react';
import { DataGrid, GridCheckCircleIcon, type GridColDef } from '@mui/x-data-grid';
import { Box, Chip, Alert, Snackbar, Typography, Paper, Button } from '@mui/material';
import { getDevicesByFilter } from '../services/DeviceService';
import type { DeviceResponse } from '../models/DeviceResponse';
import { DeviceStatusLabels } from '../enums/DeviceStatus';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';

export default function DevicesTable() {
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDevicesByFilter({})
      .then(setDevices)
      .catch((err) => {
        console.error('Ошибка загрузки устройств:', err);
        setError('Не удалось загрузить устройства');
      });
  }, []);

  const stats = useMemo(() => {
    const total = devices.length;
    const statusCounts: Record<string, number> = {};
    devices.forEach(device => {
      const status = device.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return { total, statusCounts };
  }, [devices]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Наименование', width: 200 },
    { field: 'serialNumber', headerName: 'Серийный номер', width: 150 },
    {
      field: 'status',
      headerName: 'Статус',
      width: 140,
      renderCell: (params) => {
        const status = params.value as string;
        const label = DeviceStatusLabels[status as keyof typeof DeviceStatusLabels] || status;
        const colorMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
          InStock: 'success',
          Repair: 'warning',
          Issued: 'info',
          Broken: 'error',
          WriteOff: 'default',
        };
        const iconMap: Record<string, React.ReactElement> = {
          InStock: <GridCheckCircleIcon />,
          Repair: <WarningIcon />,
          Issued: <InfoIcon />,
          Broken: <ErrorIcon />,
          WriteOff: <CancelIcon />,
        };
        return (
          <Chip
            label={label}
            color={colorMap[status] || 'default'}
            size="small"
            variant="outlined"
            icon={iconMap[status] || undefined}
          />
        );
      },
    },
    {
      field: 'addedDate',
      headerName: 'Дата добавления',
      width: 180,
      valueGetter: (_, row: DeviceResponse) => new Date(row.addedDate).toLocaleDateString('ru-RU'),
    },
    { field: 'brand', headerName: 'Бренд', width: 150 },
    { field: 'category', headerName: 'Категория', width: 150 },
    { field: 'address', headerName: 'Адрес', width: 200 },
    { field: 'employee', headerName: 'Сотрудник', width: 180 },
  ];

  const handleAdd = () => {
    console.log('Добавить технику');
  };

  const handleExport = () => {
    console.log('Экспорт в Excel');
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">Управление техникой</Typography>
        <Box>
          <Button variant="contained" onClick={handleAdd} sx={{ mr: 1 }}>
            Добавить технику
          </Button>
          <Button variant="outlined" onClick={handleExport}>
            Экспорт в Excel
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center', flex: '1 0 auto', boxShadow: 1 }}>
          <Typography variant="body2" color="text.secondary">Всего</Typography>
          <Typography variant="h4">{stats.total}</Typography>
        </Paper>
        {Object.entries(DeviceStatusLabels).map(([statusKey, label]) => {
          const count = stats.statusCounts[statusKey] || 0;
          return (
            <Paper key={statusKey} sx={{ p: 2, minWidth: 120, textAlign: 'center', flex: '1 0 auto', boxShadow: 1 }}>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="h4">{count}</Typography>
            </Paper>
          );
        })}
      </Box>

      <Box sx={{ height: 'calc(100vh - 310px)', width: '100%' }}>
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
    </>
  );
}