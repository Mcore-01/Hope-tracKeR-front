import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Alert, Snackbar, CircularProgress, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { DeviceRequest } from '../models/DeviceRequest';
import type { DeviceResponse } from '../models/DeviceResponse';
import { DeviceStatusLabels, type DeviceStatus } from '../enums/DeviceStatus';
import { getAllBrands } from '../services/BrandService';
import { getAllCategories } from '../services/CategoryService';
import { getAllAddresses } from '../services/AddressService';
import { getAllEmployees } from '../services/EmployeeService';
import type { Brand } from '../models/Brand';
import type { Category } from '../models/Category';
import type { Address } from '../models/Address';
import type { Employee } from '../models/Employee';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface DeviceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (device: DeviceRequest) => Promise<void>;
  initialData?: DeviceResponse | null;
}

export default function DeviceFormDialog({
  open,
  onClose,
  onSave,
  initialData,
}: DeviceFormDialogProps) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<DeviceStatus>('InStock');
  const [addressId, setAddressId] = useState<number>(0);
  const [brandId, setBrandId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [attributesList, setAttributesList] = useState<{ key: string; value: string }[]>([]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.all([
        getAllBrands(),
        getAllCategories(),
        getAllAddresses(),
        getAllEmployees(),
      ])
        .then(([brandsData, categoriesData, addressesData, employeesData]) => {
          setBrands(brandsData);
          setCategories(categoriesData);
          setAddresses(addressesData);
          setEmployees(employeesData);
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
      setSerialNumber(initialData.serialNumber);
      setStatus(initialData.status as DeviceStatus);
      setAddressId(initialData.addressId);
      setBrandId(initialData.brandId);
      setCategoryId(initialData.categoryId);
      setEmployeeId(initialData.employeeId ?? null);
      const attrs = initialData.attributes;
      if (attrs && Object.keys(attrs).length > 0) {
        setAttributesList(Object.entries(attrs).map(([key, value]) => ({ key, value })));
      } else {
        setAttributesList([]);
      }
    } else {
      setName('');
      setSerialNumber('');
      setStatus('InStock');
      setAddressId(0);
      setBrandId(0);
      setCategoryId(0);
      setEmployeeId(null);
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
    if (addressId === 0) {
      setError('Выберите адрес');
      return;
    }
    if (brandId === 0) {
      setError('Выберите бренд');
      return;
    }
    if (categoryId === 0) {
      setError('Выберите категорию');
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

    const deviceData: DeviceRequest = {
      id: initialData?.id ?? 0,
      name: name.trim(),
      serialNumber: serialNumber.trim(),
      status: status,
      addedDate: initialData?.addedDate || new Date().toISOString(),
      addressId,
      brandId,
      categoryId,
      employeeId: employeeId || null,
      attributes,
    };

    setSaving(true);
    try {
      await onSave(deviceData);
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
          {initialData ? 'Редактировать технику' : 'Добавить технику'}
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
              label="Серийный номер"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={status}
                label="Статус"
                onChange={(e) => setStatus(e.target.value as DeviceStatus)}
              >
                {Object.entries(DeviceStatusLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
              <InputLabel>Категория</InputLabel>
              <Select
                value={categoryId}
                label="Категория"
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
              >
                <MenuItem value={0}>Выберите категорию</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
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

            <FormControl fullWidth>
              <InputLabel>Сотрудник</InputLabel>
              <Select
                value={employeeId ?? ''}
                label="Сотрудник"
                onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="">Не выбран</MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.fullName}
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