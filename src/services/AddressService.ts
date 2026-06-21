import type { Address } from '../models/Address';
import api from './api';

export const getAllAddresses = (): Promise<Address[]> =>
  api.get<Address[]>('/Address').then(res => res.data);

export const getAddressById = (id: number): Promise<Address> =>
  api.get<Address>(`/Address/${id}`).then(res => res.data);

export const createAddress = (address: Omit<Address, 'id'>): Promise<number> =>
  api.post<number>('/Address/create', address).then(res => res.data);

export const updateAddress = (address: Address): Promise<void> =>
  api.put('/Address/update', address);

export const removeAddress = (id: number): Promise<void> =>
  api.delete(`/Address/${id}`);