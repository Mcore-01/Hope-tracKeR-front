export interface CartridgeRequest {
  id: number;
  name: string;
  printerModel: string;
  status: string;
  addressId: number;
  brandId: number;
  attributes: Record<string, string>;
}