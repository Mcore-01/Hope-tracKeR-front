export type CartridgeStatus = 'InStock' | 'Installed' | 'Empty' | 'Refilling' | 'WriteOff';

export const CartridgeStatusLabels: Record<CartridgeStatus, string> = {
  InStock: 'На складе',
  Installed: 'Установлен',
  Empty: 'Пустой',
  Refilling: 'Отправлен на заправку',
  WriteOff: 'Списан',
};