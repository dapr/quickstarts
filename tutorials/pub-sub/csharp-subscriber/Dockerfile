#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0-focal-arm32v7 AS base
WORKDIR /app
EXPOSE 5009

FROM mcr.microsoft.com/dotnet/sdk:6.0-focal AS build
WORKDIR /src
COPY ["csharp-subscriber.csproj", "./"]
RUN dotnet restore "csharp-subscriber.csproj" -r linux-arm
COPY . .
WORKDIR "/src/."
RUN dotnet build "csharp-subscriber.csproj" -c Release -o /app/build -r linux-arm --self-contained false --no-restore

FROM build AS publish
RUN dotnet publish "csharp-subscriber.csproj" -c Release -o /app/publish -r linux-arm --self-contained false --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "csharp-subscriber.dll"]