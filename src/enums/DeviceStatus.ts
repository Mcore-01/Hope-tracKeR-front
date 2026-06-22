export type DeviceStatus = 'InStock' | 'Repair' | 'Issued' | 'Broken' | 'WriteOff';

export const DeviceStatusLabels: Record<DeviceStatus, string> = {
  InStock: 'В наличии',
  Repair: 'В ремонте',
  Issued: 'Выдан',
  Broken: 'Сломан',
  WriteOff: 'Списан',
};