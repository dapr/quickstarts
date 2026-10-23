using Dapr.StateManagement;

[StateStore(State.Constants.DAPR_STORE_NAME)]
public partial interface IStateStore : IDaprStateStoreClient;