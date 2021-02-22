# Note: we cannot do a staged dotnet docker build here for arm/arm64. 

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:3.1
WORKDIR /app
COPY  /out .
ENTRYPOINT ["dotnet", "Subtract.dll"]
