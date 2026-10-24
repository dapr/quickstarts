package main

// ProductInventoryItem is the inventory record that the app keeps in the
// state store.
type ProductInventoryItem struct {
	ProductID   string `json:"product_id"`
	ProductName string `json:"product_name"`
	Quantity    int    `json:"quantity"`
}

// OrderItem is the product and the quantity of an order.
type OrderItem struct {
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	TotalPrice  float64 `json:"total_price"`
}

// CustomerInfo identifies the customer of an order.
type CustomerInfo struct {
	ID      string `json:"id"`
	Country string `json:"country"`
}

// Order is the input of the workflow.
type Order struct {
	ID           string       `json:"id"`
	OrderItem    OrderItem    `json:"order_item"`
	CustomerInfo CustomerInfo `json:"customer_info"`
}

// OrderStatus is the output of the workflow.
type OrderStatus struct {
	IsSuccess bool   `json:"is_success"`
	Message   string `json:"message,omitempty"`
}

// ActivityResult is the result of an activity that can succeed or fail.
type ActivityResult struct {
	IsSuccess bool   `json:"is_success"`
	Message   string `json:"message,omitempty"`
}

// ShippingDestinationResult is the answer of the shipping app to the
// destination check.
type ShippingDestinationResult struct {
	IsSuccess bool   `json:"is_success"`
	Message   string `json:"message,omitempty"`
}

// ShipmentRegistrationStatus is the payload of the shipment-registered-events
// event. The shipping app publishes it when it has registered the shipment.
type ShipmentRegistrationStatus struct {
	OrderID   string `json:"order_id"`
	IsSuccess bool   `json:"is_success"`
	Message   string `json:"message,omitempty"`
}
