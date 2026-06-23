import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import api from './api';

export const login = (data: LoginRequest): Promise<LoginResponse> =>
  api.post<LoginResponse>('/Auth', data).then(res => res.data);