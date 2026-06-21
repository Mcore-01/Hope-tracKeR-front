import type { Category } from '../models/Category';
import api from './api';

export const getAllCategories = (): Promise<Category[]> =>
  api.get<Category[]>('/Category').then(res => res.data);

export const getCategoryById = (id: number): Promise<Category> =>
  api.get<Category>(`/Category/${id}`).then(res => res.data);

export const createCategory = (category: Omit<Category, 'id'>): Promise<number> =>
  api.post<number>('/Category/create', category).then(res => res.data);

export const updateCategory = (category: Category): Promise<void> =>
  api.put('/Category/update', category);

export const removeCategory = (id: number): Promise<void> =>
  api.delete(`/Category/${id}`);