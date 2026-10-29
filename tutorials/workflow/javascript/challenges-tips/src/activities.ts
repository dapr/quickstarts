import { WorkflowActivityContext } from "@dapr/dapr";

/*
 * Placeholder types and activities so the snippets in this folder compile.
 * Replace the bodies with your own business logic.
 */
export interface Order {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
}

export interface Document {
  id: string;
  content: string;
}

export async function createOrderId(_ctx: WorkflowActivityContext, _input: string): Promise<string> {
  return "order-1";
}

export async function submitId(_ctx: WorkflowActivityContext, _orderId: string): Promise<void> {}

export async function submitDate(_ctx: WorkflowActivityContext, _orderDate: Date): Promise<void> {}

export async function getDocument(_ctx: WorkflowActivityContext, docId: string): Promise<Document> {
  return { id: docId, content: "large content" };
}

export async function updateDocument(_ctx: WorkflowActivityContext, document: Document): Promise<Document> {
  return document;
}

export async function getAndUpdateDocument(_ctx: WorkflowActivityContext, docId: string): Promise<string> {
  return docId;
}
