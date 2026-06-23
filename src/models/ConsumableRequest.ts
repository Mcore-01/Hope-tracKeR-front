export interface ConsumableRequest {
  id: number;
  name: string;
  quantity: number;
  addressId: number;
  brandId: number;
  attributes: Record<string, string>;
}