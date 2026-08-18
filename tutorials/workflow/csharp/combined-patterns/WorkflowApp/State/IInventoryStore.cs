using Dapr.StateManagement;

namespace WorkflowApp.State;

[StateStore(Constants.DAPR_INVENTORY_COMPONENT)]
public partial interface IInventoryStore: IDaprStateStoreClient;