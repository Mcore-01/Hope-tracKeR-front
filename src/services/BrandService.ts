import type { Brand } from "../models/Brand";
import api from "./api";

export const getAllBrands = (): Promise<Brand[]> =>
  api.get<Brand[]>('/Brand').then(res => res.data);

export const getBrandById = (id: string): Promise<Brand> =>
  api.get<Brand>(`/Brand/${id}`).then(res => res.data);

export const createBrand = (brand: Omit<Brand, 'id'>): Promise<Brand> =>
  api.post<Brand>('/Brand/create', brand).then(res => res.data);

export const updateBrand = (brand: Brand): Promise<void> =>
  api.put('/Brand/update', brand);

export const removeBrand = (id: string): Promise<void> =>
  api.delete(`/Brand/${id}`);