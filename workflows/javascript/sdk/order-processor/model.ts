export class OrderPayload {
    itemName: string;
    totalCost: number;
    quantity: number;

    constructor(itemName: string, totalCost: number, quantity: number) {
        this.itemName = itemName;
        this.totalCost = totalCost;
        this.quantity = quantity;
    }

    toJson(): string {
        return `{"itemName": "${this.itemName}", "quantity": ${this.quantity}, "totalCost": ${this.totalCost}}`;
    }

    toString(): string {
        return `OrderPayload(name=${this.itemName}, totalCost=${this.totalCost}, quantity=${this.quantity})`;
    }
}

export class InventoryItem {
    itemName: string;
    perItemCost: number;
    quantity: number;

    constructor(itemName: string, perItemCost: number, quantity: number) {
        this.itemName = itemName;
        this.perItemCost = perItemCost;
        this.quantity = quantity;
    }

    toString(): string {
        return `InventoryItem(itemName=${this.itemName}, perItemCost=${this.perItemCost}, quantity=${this.quantity})`;
    }
}

export class InventoryRequest {
    requestId: string;
    itemName: string;
    quantity: number;

    constructor(requestId: string, itemName: string, quantity: number) {
        this.requestId = requestId;
        this.itemName = itemName;
        this.quantity = quantity;
    }

    toString(): string {
        return `InventoryRequest(requestId=${this.requestId}, itemName=${this.itemName}, quantity=${this.quantity})`;
    }
}

export class InventoryResult {
    success: boolean;
    inventoryItem?: InventoryItem;

    constructor(success: boolean, inventoryItem: InventoryItem | undefined) {
        this.success = success;
        this.inventoryItem = inventoryItem;
    }

    toString(): string {
        return `InventoryResult(success=${this.success}, inventoryItem=${this.inventoryItem})`;
    }
}

export class OrderPaymentRequest {
    requestId: string;
    itemBeingPurchased: string;
    amount: number;
    quantity: number;

    constructor(requestId: string, itemBeingPurchased: string, amount: number, quantity: number) {
        this.requestId = requestId;
        this.itemBeingPurchased = itemBeingPurchased;
        this.amount = amount;
        this.quantity = quantity;
    }

    toString(): string {
        return `PaymentRequest(requestId=${this.requestId}, itemBeingPurchased=${this.itemBeingPurchased}, amount=${this.amount}, quantity=${this.quantity})`;
    }
}

export class ApprovalRequired {
    approval: boolean;

    constructor(approval: boolean) {
        this.approval = approval;
    }

    toString(): string {
        return `ApprovalRequired(approval=${this.approval})`;
    }
}

export class OrderNotification {
    message: string;

    constructor(message: string) {
        this.message = message;
    }

    toString(): string {
        return `Notification(message=${this.message})`;
    }
}
