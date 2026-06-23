export interface CartridgeResponse {
  id: number;
  name: string;
  printerModel: string;
  status: string;
  addressId: number;
  address: string;
  brandId: number;
  brand: string;
  attributes: Record<string, string>;
}