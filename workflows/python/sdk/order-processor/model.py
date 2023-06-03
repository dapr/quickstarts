
from dataclasses import dataclass
import make_json_serializable  # apply monkey-patch

@dataclass
class OrderPayload():
    item_name: str
    total_cost: int
    quantity: int

    def to_json(self):  # New special method.
        """ Convert to JSON format string representation. """
        return f'{{"item_name": "{self.item_name}", "quantity": {self.quantity},\
                          "total_cost": {self.total_cost}}}'

    def __str__(self):
        return f"OrderPayload(name={self.item_name}, total_cost={self.total_cost}, quantity={self.quantity})"


@dataclass
class InventoryItem:
    item_name: str
    per_item_cost: int
    quantity: int

    def __str__(self):
        return f"InventoryItem(item_name={self.item_name}, per_item_cost={self.per_item_cost}, quantity={self.quantity})"


@dataclass
class InventoryRequest:
    request_id: str
    item_name: str
    quantity: int

    def __str__(self):
        return f"InventoryRequest(request_id={self.request_id}, item_name={self.item_name}, quantity={self.quantity})"

@dataclass
class InventoryResult:
    success: bool
    inventory_item: InventoryItem

    def __str__(self):
        return f"InventoryResult(success={self.success}, inventory_item={self.inventory_item})"

@dataclass
class PaymentRequest:
    request_id: str
    item_being_purchased: str
    amount: int
    quantity: int

    def __str__(self):
        return f"PaymentRequest(request_id={self.request_id}, item_being_purchased={self.item_being_purchased}, amount={self.amount}, quantity={self.quantity})"

@dataclass
class ApprovalRequired:
    approval: bool

    def __str__(self):
        return f"ApprovalRequired(approval={self.approval})"


@dataclass
class OrderResult:
    processed: bool

    def __str__(self):
        return f"OrderResult(processed={self.processed})"

@dataclass
class Notification:
    message: str

    def __str__(self):
        return f"Notification(message={self.message})"
