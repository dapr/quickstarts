import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.workflow(name='large_payload_size_workflow')
def large_payload_size_workflow(ctx: wf.DaprWorkflowContext, doc_id: str):
    """
    Do not pass large payloads between activities.
    They are stored in the Dapr state store twice, one as output argument 
    for GetDocument, and once as input argument for UpdateDocument.
    """
    document = yield ctx.call_activity(get_document, input=doc_id)
    updated_document = yield ctx.call_activity(update_document, input=document)
    
    # More activities to process the updated document

    return updated_document

@wf_runtime.workflow(name='small_payload_size_workflow')
def small_payload_size_workflow(ctx: wf.DaprWorkflowContext, doc_id: str):
    """
    Do pass small payloads between activities, preferably IDs only, or objects that are quick to (de)serialize in large volumes.
    Combine multiple actions, such as document retrieval and update, into a single activity.
    """
    updated_doc_id = yield ctx.call_activity(get_and_update_document, input=doc_id)
    
    # More activities to process the updated document

    return updated_doc_id
