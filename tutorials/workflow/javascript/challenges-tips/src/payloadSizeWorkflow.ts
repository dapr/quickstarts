import { Task, WorkflowContext } from "@dapr/dapr";
import { Document, getAndUpdateDocument, getDocument, updateDocument } from "./activities";

export function* largePayloadSizeWorkflow(ctx: WorkflowContext, docId: string): Generator<Task<unknown>, Document, any> {
  /*
   * Do not pass large payloads between activities.
   * They are stored in the Dapr state store twice, one as output argument
   * for getDocument, and once as input argument for updateDocument.
   */
  const document: Document = yield ctx.callActivity(getDocument, docId);
  const updatedDocument: Document = yield ctx.callActivity(updateDocument, document);

  // More activities to process the updated document

  return updatedDocument;
}

export function* smallPayloadSizeWorkflow(ctx: WorkflowContext, docId: string): Generator<Task<unknown>, string, any> {
  /*
   * Do pass small payloads between activities, preferably IDs only, or objects that are quick to (de)serialize in large volumes.
   * Combine multiple actions, such as document retrieval and update, into a single activity, or use the Dapr State Store API to store more data.
   */
  const updatedDocId: string = yield ctx.callActivity(getAndUpdateDocument, docId);

  // More activities to process the updated document

  return updatedDocId;
}
