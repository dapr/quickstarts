# Use the official .NET 8 SDK image to build the application
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore --disable-parallel

# Copy the rest of the application code and build the application
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET 8 runtime image to run the application
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

# Expose the port the application runs on
EXPOSE 80

# Run the application
ENTRYPOINT ["dotnet", "csharp-subscriber.dll"]
