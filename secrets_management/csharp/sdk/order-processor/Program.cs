using System;
using Dapr.SecretsManagement;
using Dapr.SecretsManagement.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Secrets;

var host = Host.CreateApplicationBuilder(args);

// Register the secrets 
host.Services.AddDaprSecretsManagementClient();

var app = host.Build();

await app.RunAsync();


// Option 1 - Use the secrets client
var secretsClient = app.Services.GetRequiredService<DaprSecretsManagementClient>();
var retrievedSecret = await secretsClient.GetSecretAsync(Constants.DAPR_SECRET_STORE, Constants.SECRET_NAME);
Console.WriteLine($"Fetched secret via client: {string.Join(", ", retrievedSecret)}");

// Option 2 - Use the secret store interface
// var secretStore = app.Services.GetRequiredService<ISecretStore>();
// Console.WriteLine($"Fetched secret via interface: {string.Join(", ", secretStore.Secret)}");
