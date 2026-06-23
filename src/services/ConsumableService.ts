import type { ConsumableRequest } from '../models/ConsumableRequest';
import type { ConsumableResponse } from '../models/ConsumableResponse';
import type { ItemFilter } from '../models/ItemFilter';
import api from './api';

export const getConsumablesByFilter = (filter: ItemFilter): Promise<ConsumableResponse[]> =>
  api.post<ConsumableResponse[]>('/Consumable/сonsumables/filter', filter).then(res => res.data);

export const getConsumableById = (id: number): Promise<ConsumableResponse> =>
  api.get<ConsumableResponse>(`/Consumable/${id}`).then(res => res.data);

export const createConsumable = (consumable: ConsumableRequest): Promise<number> =>
  api.post<number>('/Consumable/create', consumable).then(res => res.data);

export const updateConsumable = (consumable: ConsumableRequest): Promise<void> =>
  api.put('/Consumable/update', consumable);

export const deleteConsumable = (id: number): Promise<void> =>
  api.delete(`/Consumable/${id}`);

export const exportConsumablesToExcel = (filter: ItemFilter): Promise<Blob> =>
  api.post('/Consumable/excel_items', filter, { responseType: 'blob' }).then(res => res.data);

export const increaseQuantity = (id: number, amount: number): Promise<void> =>
  api.put(`/Consumable/increase/${id}/${amount}`);

export const decreaseQuantity = (id: number, amount: number): Promise<void> =>
  api.put(`/Consumable/decrease/${id}/${amount}`);