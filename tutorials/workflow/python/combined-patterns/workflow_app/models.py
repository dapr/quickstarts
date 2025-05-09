from dataclasses import dataclass

@dataclass
class ProductInventory:
    product_id: str
    quantity: int

@dataclass
class ProductInventoryItem:
    product_id: str
    product_name: str
    quantity: int

@dataclass
class ShippingDestinationResult:
    is_success: bool
    message: str = None

    @staticmethod
    def from_dict(dict):
        return ShippingDestinationResult(**dict)

@dataclass
class ShipmentRegistrationStatus:
    order_id: str
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

@dataclass
class ActivityResult:
    is_success: bool
    message: str = None

@dataclass
class PaymentResult:
    is_success: bool

@dataclass
class RegisterShipmentResult:
    is_success: bool

@dataclass
class ReimburseCustomerResult:
    is_success: bool

@dataclass
class UpateInventoryResult:
    is_success: bool
    message: str = None
