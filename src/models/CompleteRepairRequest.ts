export interface CompleteRepairRequest {
  itemId: number;
  currentAddressId: number;
  userId: number;
  diagnosis: string;
  endDate: string;
}