export type OrderStatus = 'processing' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  product?: {
    id: string;
    sku: string;
    name: string;
    imageUrl?: string;
  };
}

export interface CreateOrderDto {
  shippingAddress: string;
  phone: string;
  notes?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  orderNumber?: string;
}

export interface OrderSummary {
  totalOrders: number;
  totalAmount: number;
  ordersByStatus: {
    processing: number;
    shipping: number;
    delivered: number;
    cancelled: number;
  };
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  processing: 'Обработка',
  shipping: 'Доставка', 
  delivered: 'Доставлен',
  cancelled: 'Отменен'
};

export const ORDER_STATUS_OPTIONS = [
  { value: 'processing', label: 'Обработка' },
  { value: 'shipping', label: 'Доставка' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменен' }
] as const;
