import type { DeviceRequest } from '../models/DeviceRequest';
import type { DeviceResponse } from '../models/DeviceResponse';
import type { ItemFilter } from '../models/ItemFilter';
import type { StartRepairRequest } from '../models/StartRepairRequest';
import type { CompleteRepairRequest } from '../models/CompleteRepairRequest';
import type { WriteOffDeviceRequest } from '../models/WriteOffDeviceRequest';
import type { IssueDeviceRequest } from '../models/IssueDeviceRequest';
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

export const startRepair = (request: StartRepairRequest): Promise<void> =>
  api.post('/Device/start_repair', request);

export const completeRepair = (request: CompleteRepairRequest): Promise<void> =>
  api.post('/Device/end_repair', request);

export const writeOffDevice = (request: WriteOffDeviceRequest): Promise<void> =>
  api.put('/Device/write_off', request);

export const issueDevice = (request: IssueDeviceRequest): Promise<void> =>
  api.post('/Device/issue', request);

export const generateRepairAct = (itemId: number): Promise<Blob> =>
  api.post(`/Device/repair_act/${itemId}`, {}, { responseType: 'blob' }).then(res => res.data);