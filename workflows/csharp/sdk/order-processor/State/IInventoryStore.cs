using Dapr.StateManagement;

namespace WorkflowConsoleApp.Models.State;

[StateStore("statestore")]
public partial interface IInventoryStore : IDaprStateStoreClient;