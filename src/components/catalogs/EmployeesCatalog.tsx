import { useCallback, useEffect, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField, Typography, IconButton, Tooltip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Employee } from '../../models/Employee';
import { createEmployee, getAllEmployees, removeEmployee, updateEmployee } from '../../services/EmployeeService';

export default function EmployeesCatalog() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [fullName, setFullName] = useState('');
  const [staff, setStaff] = useState('');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning'>('error');

  const showNotification = useCallback((message: string, severity: 'error' | 'warning' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const loadEmployees = useCallback(() => {
    getAllEmployees()
      .then(data => setEmployees(data))
      .catch(error => {
        console.error('Ошибка загрузки сотрудников:', error);
        showNotification('Не удалось загрузить сотрудников', 'error');
      });
  }, [showNotification]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFullName(employee.fullName);
      setStaff(employee.staff);
    } else {
      setEditingEmployee(null);
      setFullName('');
      setStaff('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFullName('');
    setStaff('');
  };

  const handleSave = async () => {
    if (!fullName.trim() || !staff.trim()) {
      showNotification('Все поля должны быть заполнены', 'warning');
      return;
    }

    try {
      if (editingEmployee) {
        await updateEmployee({ ...editingEmployee, fullName: fullName.trim(), staff: staff.trim() });
      } else {
        await createEmployee({ fullName: fullName.trim(), staff: staff.trim() });
      }
      handleCloseDialog();
      loadEmployees();
    } catch (error) {
      console.error('Ошибка сохранения сотрудника:', error);
      showNotification('Не удалось сохранить сотрудника', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Уверены что хотите удалить сотрудника?')) return;
    try {
      await removeEmployee(id);
      loadEmployees();
    } catch (error) {
      console.error('Ошибка удаления сотрудника:', error);
      showNotification('Не удалось удалить сотрудника', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'fullName', headerName: 'ФИО', width: 250 },
    { field: 'staff', headerName: 'Должность', width: 300 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Сотрудники
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Добавить
        </Button>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', mt: 2 }}>
        <DataGrid
          rows={employees}
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
        <DialogTitle>{editingEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ФИО"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Должность"
            fullWidth
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
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