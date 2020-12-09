FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim-amd64 AS build-env
WORKDIR /app
ARG DOTNET_PLATFORM="x64"


# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore -r linux-${DOTNET_PLATFORM}

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:3.1
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "Subtract.dll"]