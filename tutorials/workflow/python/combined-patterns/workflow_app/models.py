from pydantic import BaseModel
from typing import Optional

class ProductInventory(BaseModel):
    product_id: str
    quantity: int

class ProductInventoryItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int

class ShippingDestinationResult(BaseModel):
    is_success: bool
    message: Optional[str] = None

    @staticmethod
    def from_dict(dict):
        return ShippingDestinationResult(**dict)

class ShipmentRegistrationStatus(BaseModel):
    order_id: str
    is_success: bool
    message: Optional[str] = None

    @staticmethod
    def from_dict(dict):
        return ShipmentRegistrationStatus(**dict)

class CustomerInfo(BaseModel):
    id: str
    country: str

    @staticmethod
    def from_dict(dict):
        return CustomerInfo(**dict)

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    total_price: float

    @staticmethod
    def from_dict(dict):
        return OrderItem(**dict)

class Order(BaseModel):
    id: str
    order_item: OrderItem
    customer_info: CustomerInfo

class OrderStatus(BaseModel):
    is_success: bool
    message: Optional[str] = None

class ActivityResult(BaseModel):
    is_success: bool
    message: Optional[str] = None

class PaymentResult(BaseModel):
    is_success: bool

class RegisterShipmentResult(BaseModel):
    is_success: bool

class ReimburseCustomerResult(BaseModel):
    is_success: bool

class UpdateInventoryResult(BaseModel):
    is_success: bool
    message: Optional[str] = None