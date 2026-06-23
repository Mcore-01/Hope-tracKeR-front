import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, Snackbar, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllAddresses } from '../../services/AddressService';
import type { Address } from '../../models/Address';

interface CompleteRefillDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (itemId: number, addressId: number, endDate: string) => Promise<void>;
  cartridgeId: number | null;
}

export default function CompleteRefillDialog({ open, onClose, onConfirm, cartridgeId }: CompleteRefillDialogProps) {
  const [addressId, setAddressId] = useState<number>(0);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
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
      setEndDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (cartridgeId === null) {
      setError('Ошибка: картридж не найден');
      return;
    }
    if (addressId === 0) {
      setError('Выберите адрес');
      return;
    }
    if (!endDate) {
      setError('Выберите дату завершения');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(cartridgeId, addressId, endDate);
      onClose();
    } catch (error) {
      console.error('Ошибка завершения заправки:', error);
      setError('Не удалось завершить заправку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Завершить заправку</DialogTitle>
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
          <Button onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? 'Сохранение...' : 'Завершить'}
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