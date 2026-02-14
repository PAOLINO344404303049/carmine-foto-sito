
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING',
  PAID = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  PRINTED = 'READY',
  COLLECTED = 'COLLECTED'
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'In attesa',
  [OrderStatus.PAID]: 'Ricevuto',
  [OrderStatus.PROCESSING]: 'In lavorazione',
  [OrderStatus.PRINTED]: 'Pronto',
  [OrderStatus.COLLECTED]: 'Ritirato'
};

export enum PaymentMethod {
  AT_COLLECTION = 'Paga al ritiro',
  ONLINE_SUMUP = 'Paga online (SumUp)'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin';
  mustChangePassword?: boolean;
}

export interface PhotoPackage {
  id: string;
  name: string;
  count: number;
  price: number;
  description: string;
}

export interface PhotoFile {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone: string;
  packageId: string;
  packageName: string;
  photos: PhotoFile[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  total: number;
}