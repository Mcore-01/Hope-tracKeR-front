export interface DeviceRequest {
  id: number; 
  name: string;
  serialNumber?: string; 
  status: string; 
  addedDate: string; 
  addressId: number;
  brandId: number;
  categoryId: number;
  employeeId?: number | null;
  attributes: Record<string, string>;
}