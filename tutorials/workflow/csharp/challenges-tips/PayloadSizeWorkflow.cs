using Dapr.Workflow;

namespace WorkflowApp
{
    public class LargePayloadSizeWorkflow : Workflow<string, LargeDocument>
    {
        public override async Task<LargeDocument> RunAsync(WorkflowContext context, string id)
        {
            // Do not pass large payloads between activities.
            // They are stored in the Dapr state store twice, one as output argument 
            // for GetDocument, and once as input argument for UpdateDocument.
            var document = await context.CallActivityAsync<LargeDocument>(
                "GetDocument",
                id);

            var updatedDocument = await context.CallActivityAsync<LargeDocument>(
                "UpdateDocument",
                document);

            // More activities to process the updated document...

            return updatedDocument;
        }
    }


    public class SmallPayloadSizeWorkflow : Workflow<string, string>
    {
        public override async Task<string> RunAsync(WorkflowContext context, string id)
        {
            // Do pass small payloads between activities, preferably IDs only, or objects that are quick to (de)serialize in large volumes.
            // Combine multiple actions, such as document retrieval and update, into a single activity.
            var documentId = await context.CallActivityAsync<string>(
                "GetAndUpdateDocument",
                id);

            // More activities to process the updated document...

            return documentId;
        }
    }

    public record LargeDocument(string Id, object Data);
}