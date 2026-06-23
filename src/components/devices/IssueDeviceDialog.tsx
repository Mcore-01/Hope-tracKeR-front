import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllEmployees } from '../../services/EmployeeService';
import type { Employee } from '../../models/Employee';
import { issueDevice } from '../../services/DeviceService';
import { useAuth } from '../../hooks/useAuth';

interface IssueDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  deviceId: number;
  onSuccess: () => void;
}

export default function IssueDeviceDialog({
  open,
  onClose,
  deviceId,
  onSuccess,
}: IssueDeviceDialogProps) {
  const { userId } = useAuth();
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getAllEmployees()
        .then(setEmployees)
        .catch(() => setError('Не удалось загрузить сотрудников'));
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setEmployeeId(0);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (employeeId === 0) {
      setError('Выберите сотрудника');
      return;
    }

    setSaving(true);
    try {
      await issueDevice({
        itemId: deviceId,
        employeeId: employeeId,
        userId: Number(userId),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка выдачи:', error);
      setError('Не удалось выдать устройство');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Выдать устройство</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Сотрудник</InputLabel>
              <Select
                value={employeeId}
                label="Сотрудник"
                onChange={(e) => setEmployeeId(Number(e.target.value))}
                required
              >
                <MenuItem value={0}>Выберите сотрудника</MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Выдача...' : 'Выдать'}
          </Button>
        </DialogActions>
      </Dialog>

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