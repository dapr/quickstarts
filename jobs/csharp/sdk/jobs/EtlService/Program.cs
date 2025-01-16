var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/etl/{taskId}", async (ILogger<Program> logger, Guid taskId) =>
{
    Log.LogEtlStart(logger, taskId);
    
    //Simulate running some sort of ETL operation
    await Task.Delay(TimeSpan.FromSeconds(7));

    return TypedResults.Ok;
});

await app.RunAsync();

static partial class Log
{
    [LoggerMessage(LogLevel.Information, "Starting task {taskId} on service")]
    public static partial void LogEtlStart(ILogger logger, Guid taskId);
}