
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

export interface CustomProduct {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
  image: string;
  category: 't-shirt' | 'keychain' | 'necklace' | 'pillow' | 'phone_case' | 'mug';
  sizes?: string[]; // Per t-shirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  requiresDeviceModel?: boolean; // Per cover smartphone
  maxPhotos?: number; // Per tazza: fino a 3 foto
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
  // Campi opzionali specifici per Prodotti Personalizzati
  orderType?: 'photo_package' | 'custom_product';
  productId?: string;
  size?: string;
  deviceModel?: string;
  quantity?: number;
  unitPrice?: number;
  customerLastName?: string;
  customPaymentMethod?: 'pickup_pay_in_store' | 'pickup_pay_now';
  paymentChoice?: string;
}