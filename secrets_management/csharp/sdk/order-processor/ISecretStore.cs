using Dapr.SecretsManagement.Abstractions;

namespace Secrets;

[SecretStore(Constants.DAPR_SECRET_STORE)]
public partial interface ISecretStore
{
	[Secret(Constants.SECRET_NAME)]
	public string Secret { get; } 
}