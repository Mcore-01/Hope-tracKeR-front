import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, Snackbar, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllAddresses } from '../../services/AddressService';
import type { Address } from '../../models/Address';

interface StartRefillDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (addressId: number, startDate: string) => Promise<void>;
}

export default function StartRefillDialog({ open, onClose, onConfirm }: StartRefillDialogProps) {
  const [addressId, setAddressId] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setStartDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (addressId === 0) {
      setError('Выберите адрес');
      return;
    }
    if (!startDate) {
      setError('Выберите дату начала');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(addressId, startDate);
      onClose();
    } catch (error) {
      console.error('Ошибка отправки на заправку:', error);
      setError('Не удалось отправить на заправку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Отправить картридж на заправку</DialogTitle>
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
          <Button onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить'}
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