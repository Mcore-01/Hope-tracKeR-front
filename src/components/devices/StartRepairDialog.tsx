import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllAddresses } from '../../services/AddressService';
import type { Address } from '../../models/Address';
import { startRepair } from '../../services/DeviceService';

interface StartRepairDialogProps {
  open: boolean;
  onClose: () => void;
  deviceId: number;
  onSuccess: () => void;
}

export default function StartRepairDialog({
  open,
  onClose,
  deviceId,
  onSuccess,
}: StartRepairDialogProps) {
  const [addressId, setAddressId] = useState<number>(0);
  const [descriptionFailure, setDescriptionFailure] = useState('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getAllAddresses()
        .then(setAddresses)
        .catch((error) => {
          console.error('Ошибка загрузки адресов:', error);
          setError('Не удалось загрузить адреса');
        });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setAddressId(0);
      setDescriptionFailure('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (addressId === 0) {
      setError('Выберите адрес');
      return;
    }
    if (!descriptionFailure.trim()) {
      setError('Опишите неисправность');
      return;
    }
    if (!startDate) {
      setError('Выберите дату начала');
      return;
    }

    setSaving(true);
    try {
      await startRepair({
        itemId: deviceId,
        currentAddressId: addressId,
        userId: 1,
        descriptionFailure: descriptionFailure.trim(),
        startDate: new Date(startDate).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка отправки в ремонт:', error);
      setError('Не удалось отправить устройство в ремонт');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Отправить устройство в ремонт</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Адрес</InputLabel>
              <Select
                value={addressId}
                label="Адрес"
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
              label="Описание неисправности"
              value={descriptionFailure}
              onChange={(e) => setDescriptionFailure(e.target.value)}
              multiline
              rows={3}
              required
              fullWidth
            />

            <TextField
              label="Дата начала"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
            {saving ? 'Отправка...' : 'Отправить в ремонт'}
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