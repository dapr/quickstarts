package main

// OrderRequest represents an incoming order
type OrderRequest struct {
	OrderID       string  `json:"orderId"`
	CustomerID    string  `json:"customerId"`
	Items         []Item  `json:"items"`
	PaymentMethod string  `json:"paymentMethod"`
	Total         float64 `json:"total"`
}

// CalculateTotal calculates the total price for all items in the order
func (o *OrderRequest) CalculateTotal() float64 {
	total := 0.0
	for _, item := range o.Items {
		total += item.Price * float64(item.Quantity)
	}
	o.Total = total
	return total
}

// Item represents a product in an order
type Item struct {
	ProductID string  `json:"productId"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
}

// OrderValidationResult represents the result of order validation
type OrderValidationResult struct {
	Valid   bool    `json:"valid"`
	Total   float64 `json:"total"`
	Message string  `json:"message"`
}

// InventoryResult represents the result of inventory reservation
type InventoryResult struct {
	Success       bool   `json:"success"`
	ReservedItems []Item `json:"reservedItems"`
	Message       string `json:"message"`
}

// RecommendedItem represents a recommended product
type RecommendedItem struct {
	ProductID string  `json:"productId"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Reason    string  `json:"reason"`
}

// RecommendationResult represents the result of AI recommendations
type RecommendationResult struct {
	Success         bool              `json:"success"`
	Recommendations []RecommendedItem `json:"recommendations"`
	Message         string            `json:"message"`
}

// OrderResult represents the final result of order processing
type OrderResult struct {
	OrderID    string  `json:"orderId"`
	CustomerID string  `json:"customerId"`
	Status     string  `json:"status"`
	Total      float64 `json:"total"`
	Message    string  `json:"message"`
}
