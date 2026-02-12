
export enum OrderStatus {
  PENDING = 'In attesa',
  PROCESSING = 'In lavorazione',
  PRINTED = 'Stampato',
  COLLECTED = 'Ritirato'
}

export enum PaymentMethod {
  AT_COLLECTION = 'Paga al ritiro',
  ONLINE_SUMUP = 'Paga online (SumUp)'
}

export interface User {
  id: string;
  name: string;
  email: string;
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
  userEmail: string; // Aggiunto per notifiche
  packageId: string;
  packageName: string;
  photos: PhotoFile[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  total: number;
}
