package challengestips

import "github.com/dapr/durabletask-go/workflow"

// Order is the input of IdempotentActivity.
type Order struct {
	ID          string  `json:"id"`
	Description string  `json:"description"`
	UnitPrice   float64 `json:"unit_price"`
	Quantity    int     `json:"quantity"`
}

// IdempotentActivity: beware of non-idempotent operations in an activity.
// Dapr Workflow guarantees at-least-once execution of activities, so activities
// might be executed more than once in case an activity is not ran to completion
// successfully.
// For instance, can you insert a record to a database twice without side effects?
//
//	INSERT INTO Orders (Id, Description, UnitPrice, Quantity) VALUES (?, ?, ?, ?)
//
// It is best to perform a check if a record already exists before inserting it.
func IdempotentActivity(ctx workflow.ActivityContext) (any, error) {
	var orderItem Order
	if err := ctx.GetInput(&orderItem); err != nil {
		return false, err
	}

	return true, nil
}
