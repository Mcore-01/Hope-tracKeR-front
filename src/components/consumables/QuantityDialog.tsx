import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useState } from 'react';

interface QuantityDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
  title: string;
  buttonText: string;
  buttonColor?: 'primary' | 'success' | 'warning' | 'error';
}

export default function QuantityDialog({ open, onClose, onConfirm, title, buttonText, buttonColor = 'primary' }: QuantityDialogProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm(numAmount);
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Количество"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1 } }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button onClick={handleConfirm} variant="contained" color={buttonColor} disabled={loading}>
          {loading ? 'Сохранение...' : buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}