import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { writeOffDevice } from '../services/DeviceService';

interface WriteOffDialogProps {
  open: boolean;
  onClose: () => void;
  deviceId: number;
  onSuccess: () => void;
}

export default function WriteOffDialog({
  open,
  onClose,
  deviceId,
  onSuccess,
}: WriteOffDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await writeOffDevice({
        itemId: deviceId,
        userId: 1,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка списания:', error);
      setError('Не удалось списать устройство');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Списать устройство</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography>
              Вы уверены, что хотите списать это устройство?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} variant="contained" color="error" disabled={saving}>
            {saving ? 'Списание...' : 'Списать'}
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