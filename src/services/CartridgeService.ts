import type { CartridgeRequest } from '../models/CartridgeRequest';
import type { CartridgeResponse } from '../models/CartridgeResponse';
import type { StartRefillRequest } from '../models/StartRefillRequest';
import type { CompleteRefillRequest } from '../models/CompleteRefillRequest';
import type { ItemFilter } from '../models/ItemFilter';
import api from './api';

export const getCartridgesByFilter = (filter: ItemFilter): Promise<CartridgeResponse[]> =>
  api.post<CartridgeResponse[]>('/Cartridge/cartridges/filter', filter).then(res => res.data);

export const getCartridgeById = (id: number): Promise<CartridgeResponse> =>
  api.get<CartridgeResponse>(`/Cartridge/${id}`).then(res => res.data);

export const createCartridge = (cartridge: CartridgeRequest): Promise<number> =>
  api.post<number>('/Cartridge/create', cartridge).then(res => res.data);

export const updateCartridge = (cartridge: CartridgeRequest): Promise<void> =>
  api.put('/Cartridge/update', cartridge);

export const deleteCartridge = (id: number): Promise<void> =>
  api.delete(`/Cartridge/${id}`);

export const exportCartridgesToExcel = (filter: ItemFilter): Promise<Blob> =>
  api.post('/Cartridge/excel_items', filter, { responseType: 'blob' }).then(res => res.data);

export const startRefill = (request: StartRefillRequest): Promise<void> =>
  api.post('/Cartridge/start_refill', request);

export const completeRefill = (request: CompleteRefillRequest): Promise<void> =>
  api.post('/Cartridge/end_refill', request);

export const generateRefillAct = (itemId: number): Promise<Blob> =>
  api.post(`/Cartridge/refill_act/${itemId}`, {}, { responseType: 'blob' }).then(res => res.data);