from pydantic import BaseModel
from typing import Optional

class ShipmentRegistrationStatus(BaseModel):
    order_id: str
    is_success: bool
    message: Optional[str] = None

class ShippingDestinationResult(BaseModel):
    is_success: bool
    message: Optional[str] = None

class CustomerInfo(BaseModel):
    id: str
    country: str

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    total_price: float

class Order(BaseModel):
    id: str
    order_item: OrderItem
    customer_info: CustomerInfo