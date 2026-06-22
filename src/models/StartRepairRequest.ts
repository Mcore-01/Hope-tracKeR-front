export interface StartRepairRequest {
  itemId: number;
  currentAddressId: number;
  userId: number;
  descriptionFailure: string;
  startDate: string; 
}