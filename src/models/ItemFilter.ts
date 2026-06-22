export interface ItemFilter {
  searchField?: string | null;
  status?: string | null; 
  addedDateFrom?: string | null;
  addedDateTo?: string | null;
  addressId?: number | null;
  brandId?: number | null;
  printerModel?: string | null;
  attributes?: Record<string, string> | null;
}