import { useEffect, useState, useMemo } from 'react';
import { DataGrid, GridCheckCircleIcon, type GridColDef } from '@mui/x-data-grid';
import { Box, Chip, Alert, Snackbar, Typography, Paper, Button, IconButton, Tooltip } from '@mui/material';
import { getDevicesByFilter, createDevice, updateDevice, deleteDevice, exportDevicesToExcel } from '../../services/DeviceService';
import type { DeviceResponse } from '../../models/DeviceResponse';
import { DeviceStatusLabels } from '../../enums/DeviceStatus';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DeviceFormDialog from './DeviceFormDialog';
import StartRepairDialog from './StartRepairDialog';
import IssueDeviceDialog from './IssueDeviceDialog';
import WriteOffDialog from './WriteOffDialog';
import type { DeviceRequest } from '../../models/DeviceRequest';
import { useAuth } from '../../hooks/useAuth';


export default function DevicesTable() {
  const { isAuth } = useAuth();
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceResponse | null>(null);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [repairDeviceId, setRepairDeviceId] = useState<number | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueDeviceId, setIssueDeviceId] = useState<number | null>(null);
  const [writeOffDialogOpen, setWriteOffDialogOpen] = useState(false);
  const [writeOffDeviceId, setWriteOffDeviceId] = useState<number | null>(null);

  const loadDevices = () => {
    getDevicesByFilter({})
      .then(setDevices)
      .catch((error) => {
        console.error('Ошибка загрузки устройств:', error);
        setError('Не удалось загрузить устройства');
      });
  };

  useEffect(() => {
    loadDevices();
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

  const handleAdd = () => {
    setEditingDevice(null);
    setDialogOpen(true);
  };

  const handleEdit = (device: DeviceResponse) => {
    setEditingDevice(device);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это устройство?')) return;
    try {
      await deleteDevice(id);
      loadDevices();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setError('Не удалось удалить устройство');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportDevicesToExcel({});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Устройства.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      setError('Не удалось экспортировать данные');
    }
  };

  const handleSaveDevice = async (deviceData: DeviceRequest) => {
    try {
      if (editingDevice) {
        await updateDevice(deviceData);
      } else {
        await createDevice(deviceData);
      }
      loadDevices();
      setDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError('Не удалось сохранить устройство');
      throw error;
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 30 },
    { field: 'name', headerName: 'Наименование', width: 180 },
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
      width: 120,
      valueGetter: (_, row: DeviceResponse) => new Date(row.addedDate).toLocaleDateString('ru-RU'),
    },
    { field: 'brand', headerName: 'Бренд', width: 130 },
    { field: 'category', headerName: 'Категория', width: 130 },
    { field: 'address', headerName: 'Адрес', width: 320 },
    { field: 'employee', headerName: 'Сотрудник', width: 180 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 200,
      renderCell: (params) => {
        const device = params.row as DeviceResponse;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {isAuth && (
              <>
                <Tooltip title="Удалить">
                  <IconButton size="small" color="error" onClick={() => handleDelete(device.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {device.status === 'InStock' && (
                  <>
                    <Tooltip title="В ремонт">
                      <IconButton size="small" color="warning" onClick={() => {
                        setRepairDeviceId(device.id);
                        setRepairDialogOpen(true);
                      }}>
                        <BuildIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Выдать">
                      <IconButton size="small" color="primary" onClick={() => {
                        setIssueDeviceId(device.id);
                        setIssueDialogOpen(true);
                      }}>
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {device.status !== 'WriteOff' && (
                  <Tooltip title="Списать">
                    <IconButton size="small" color="secondary" onClick={() => {
                      setWriteOffDeviceId(device.id);
                      setWriteOffDialogOpen(true);
                    }}>
                      <DeleteSweepIcon fontSize="small" />
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
        <Typography variant="h5" component="h2">Управление техникой</Typography>
        <Box>
          {isAuth && (
            <Button variant="contained" onClick={handleAdd} sx={{ mr: 1 }}>
              Добавить технику
            </Button>
          )}
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
          onRowDoubleClick={(params) => handleEdit(params.row as DeviceResponse)}
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

      <DeviceFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveDevice}
        initialData={editingDevice}
      />

      <StartRepairDialog
        open={repairDialogOpen}
        onClose={() => setRepairDialogOpen(false)}
        deviceId={repairDeviceId!}
        onSuccess={loadDevices}
      />

      <IssueDeviceDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        deviceId={issueDeviceId!}
        onSuccess={loadDevices}
      />

      <WriteOffDialog
        open={writeOffDialogOpen}
        onClose={() => setWriteOffDialogOpen(false)}
        deviceId={writeOffDeviceId!}
        onSuccess={loadDevices}
      />
    </>
  );
}