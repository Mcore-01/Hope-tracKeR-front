export interface ConsumableResponse {
  id: number;
  name: string;
  quantity: number;
  addressId: number;
  address: string;
  brandId: number;
  brand: string;
  attributes: Record<string, string>;
}