from dataclasses import dataclass

@dataclass
class ShipmentRegistrationStatus:
    order_id: str
    is_success: bool
    message: str = None

@dataclass
class ShippingDestinationResult:
    is_success: bool
    message: str = None

@dataclass
class CustomerInfo:
    id: str
    country: str

@dataclass
class OrderItem:
    product_id: str
    product_name: str
    quantity: int
    total_price: float

@dataclass
class Order:
    id: str
    order_item: OrderItem
    customer_info: CustomerInfo