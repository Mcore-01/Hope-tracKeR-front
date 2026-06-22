import type { DeviceRequest } from '../models/DeviceRequest';
import type { DeviceResponse } from '../models/DeviceResponse';
import type { ItemFilter } from '../models/ItemFilter';
import api from './api';

export const getDevicesByFilter = (filter: ItemFilter): Promise<DeviceResponse[]> =>
  api.post<DeviceResponse[]>('/Device/devices/filter', filter).then(res => res.data);

export const getDeviceById = (id: number): Promise<DeviceResponse> =>
  api.get<DeviceResponse>(`/Device/${id}`).then(res => res.data);

export const createDevice = (device: DeviceRequest): Promise<number> =>
  api.post<number>('/Device/create', device).then(res => res.data);

export const updateDevice = (device: DeviceRequest): Promise<void> =>
  api.put('/Device/update', device);

export const deleteDevice = (id: number): Promise<void> =>
  api.delete(`/Device/${id}`);

export const exportDevicesToExcel = (filter: ItemFilter): Promise<Blob> =>
  api.post('/Device/excel_items', filter, { responseType: 'blob' }).then(res => res.data);