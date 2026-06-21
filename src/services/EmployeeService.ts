import type { Employee } from '../models/Employee';
import api from './api';

export const getAllEmployees = (): Promise<Employee[]> =>
  api.get<Employee[]>('/Employee').then(res => res.data);

export const getEmployeeById = (id: number): Promise<Employee> =>
  api.get<Employee>(`/Employee/${id}`).then(res => res.data);

export const createEmployee = (employee: Omit<Employee, 'id'>): Promise<number> =>
  api.post<number>('/Employee/create', employee).then(res => res.data);

export const updateEmployee = (employee: Employee): Promise<void> =>
  api.put('/Employee/update', employee);

export const removeEmployee = (id: number): Promise<void> =>
  api.delete(`/Employee/${id}`);