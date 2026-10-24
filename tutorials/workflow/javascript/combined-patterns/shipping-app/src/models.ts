export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
}

export interface CustomerInfo {
  id: string;
  country: string;
}

export interface Order {
  id: string;
  order_item: OrderItem;
  customer_info: CustomerInfo;
}

export interface ShipmentRegistrationStatus {
  order_id: string;
  is_success: boolean;
  message?: string;
}

export interface ShippingDestinationResult {
  is_success: boolean;
  message?: string;
}
