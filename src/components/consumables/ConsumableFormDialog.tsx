import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, Snackbar, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { ConsumableRequest } from '../../models/ConsumableRequest';
import type { ConsumableResponse } from '../../models/ConsumableResponse';
import { getAllBrands } from '../../services/BrandService';
import { getAllAddresses } from '../../services/AddressService';
import type { Brand } from '../../models/Brand';
import type { Address } from '../../models/Address';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ConsumableFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (consumable: ConsumableRequest) => Promise<void>;
  initialData?: ConsumableResponse | null;
}

export default function ConsumableFormDialog({ open, onClose, onSave, initialData }: ConsumableFormDialogProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [addressId, setAddressId] = useState<number>(0);
  const [brandId, setBrandId] = useState<number>(0);
  const [attributesList, setAttributesList] = useState<{ key: string; value: string }[]>([]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.all([
        getAllBrands(),
        getAllAddresses(),
      ])
        .then(([brandsData, addressesData]) => {
          setBrands(brandsData);
          setAddresses(addressesData);
        })
        .catch((error) => {
          console.error('Ошибка загрузки справочников:', error);
          setError('Не удалось загрузить справочные данные');
        });
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setQuantity(initialData.quantity);
      setAddressId(initialData.addressId);
      setBrandId(initialData.brandId);
      const attrs = initialData.attributes;
      if (attrs && Object.keys(attrs).length > 0) {
        setAttributesList(Object.entries(attrs).map(([key, value]) => ({ key, value })));
      } else {
        setAttributesList([]);
      }
    } else {
      setName('');
      setQuantity('');
      setAddressId(0);
      setBrandId(0);
      setAttributesList([]);
    }
  }, [initialData, open]);

  const handleAddAttribute = () => {
    setAttributesList([...attributesList, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const newList = [...attributesList];
    newList.splice(index, 1);
    setAttributesList(newList);
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newList = [...attributesList];
    newList[index][field] = value;
    setAttributesList(newList);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Название обязательно');
      return;
    }
    if (quantity === '' || Number(quantity) < 0) {
      setError('Введите корректное количество');
      return;
    }
    if (addressId === 0) {
      setError('Выберите адрес');
      return;
    }
    if (brandId === 0) {
      setError('Выберите бренд');
      return;
    }

    const attributes: Record<string, string> = {};
    attributesList.forEach(item => {
      const key = item.key.trim();
      const value = item.value.trim();
      if (key && value) {
        attributes[key] = value;
      }
    });

    const consumableData: ConsumableRequest = {
      id: initialData?.id ?? 0,
      name: name.trim(),
      quantity: Number(quantity),
      addressId,
      brandId,
      attributes,
    };

    setSaving(true);
    try {
      await onSave(consumableData);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {initialData ? 'Редактировать расходник' : 'Добавить расходник'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Наименование"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Количество"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Бренд</InputLabel>
              <Select
                value={brandId}
                label="Бренд"
                onChange={(e) => setBrandId(Number(e.target.value))}
                required
              >
                <MenuItem value={0}>Выберите бренд</MenuItem>
                {brands.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Атрибуты</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={handleAddAttribute}>
                  Добавить
                </Button>
              </Box>
              {attributesList.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Ключ"
                    value={item.key}
                    onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    placeholder="Значение"
                    value={item.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton size="small" color="error" onClick={() => handleRemoveAttribute(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              {attributesList.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Нет атрибутов
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
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