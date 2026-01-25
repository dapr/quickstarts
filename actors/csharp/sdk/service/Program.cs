var builder = WebApplication.CreateBuilder(args);

builder.Services.AddActors(options =>
{
    // Register actor types and configure actor settings
    options.Actors.RegisterActor<SmartDevice.ControllerActor>();
    options.Actors.RegisterActor<SmartDevice.SmokeDetectorActor>();
    options.ReentrancyConfig = new Dapr.Actors.ActorReentrancyConfig()
        {
            Enabled = true,
            MaxStackDepth = 32,
        };
});

var app = builder.Build();

app.MapActorsHandlers();

app.Run();
