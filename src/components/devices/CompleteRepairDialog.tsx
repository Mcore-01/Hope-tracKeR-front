import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllAddresses } from '../../services/AddressService';
import type { Address } from '../../models/Address';
import { completeRepair } from '../../services/DeviceService';
import { useAuth } from '../../hooks/useAuth';

interface CompleteRepairDialogProps {
  open: boolean;
  onClose: () => void;
  deviceId: number;
  onSuccess: () => void;
}

export default function CompleteRepairDialog({ open, onClose, deviceId, onSuccess }: CompleteRepairDialogProps) {
  const { userId } = useAuth();
  const [addressId, setAddressId] = useState<number>(0);
  const [diagnosis, setDiagnosis] = useState('');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getAllAddresses()
        .then(setAddresses)
        .catch(() => setError('Не удалось загрузить адреса'));
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setAddressId(0);
      setDiagnosis('');
      setEndDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (addressId === 0) {
      setError('Выберите адрес возврата');
      return;
    }
    if (!diagnosis.trim()) {
      setError('Введите диагноз');
      return;
    }
    if (!endDate) {
      setError('Выберите дату завершения');
      return;
    }

    setSaving(true);
    try {
      await completeRepair({
        itemId: deviceId,
        currentAddressId: addressId,
        userId: Number(userId),
        diagnosis: diagnosis.trim(),
        endDate: new Date(endDate).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка завершения ремонта:', error);
      setError('Не удалось завершить ремонт');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Завершить ремонт</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Адрес возврата</InputLabel>
              <Select
                value={addressId}
                label="Адрес возврата"
                onChange={(e) => setAddressId(Number(e.target.value))}
                required
              >
                <MenuItem value={0}>Выберите адрес</MenuItem>
                {addresses.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {`${a.branch}, ${a.building}, эт. ${a.floor}, ком. ${a.room}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Диагноз"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              multiline
              rows={3}
              required
              fullWidth
            />

            <TextField
              label="Дата завершения"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Сохранение...' : 'Завершить ремонт'}
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