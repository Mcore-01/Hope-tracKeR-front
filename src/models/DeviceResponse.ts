export interface DeviceResponse {
  id: number;
  name: string;
  serialNumber: string; 
  status: string;
  addedDate: string;    
  addressId: number;
  address: string;
  brandId: number;
  brand: string;
  categoryId: number;
  category: string;
  employeeId?: number | null;
  employee?: string | null;
  attributes: Record<string, string>;
}