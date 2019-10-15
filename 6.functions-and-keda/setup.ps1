$setupFolder = "./utils/base-templates"
$deployFolder = "./deploy"
$pythonName = "python-function-publisher"
$dotnetName = "csharp-function-subscriber"
$javascriptName = "javascript-function-subscriber"
$sourceFolder = "./src"

$pythonFolder = "$sourceFolder/$pythonName"
$dotnetFolder = "$sourceFolder/$dotnetName"
$javascriptFolder = "$sourceFolder/$javascriptName"


# Prompts
$resourceBase = Read-Host -Prompt "Enter resource name base"
$location = Read-Host -Prompt "Enter location"

$groupName= "$resourceBase"
$clusterName= "$resourceBase" + "-cluster"
$registryName="${resourceBase}reg"
$storageName = "${resourceBase}sa"

# Resource Group
Write-Host
Write-Host "Creating resource group $groupName..."
az group create -n $groupName -l $location


# AKS
Write-Host
Write-Host "Creating AKS cluster $clusterName..."
az aks create -g $groupName -n $clusterName --generate-ssh-keys
az aks get-credentials -n $clusterName -g $groupName
kubectl apply -f $setupFolder/helm-rbac.yaml
helm init --service-account tiller


# ACR
Write-Host
Write-Host "Creating ACR registry $registryName..."
az acr create --resource-group $groupName --name $registryName --sku Basic
$CLIENT_ID= az aks show --resource-group $groupName --name $clusterName --query "servicePrincipalProfile.clientId" --output tsv
$ACR_ID= az acr show --name $registryName --resource-group $groupName --query "id" --output tsv

Write-Host
Write-Host "Connecting ACR and AKS..."
az role assignment create --assignee $CLIENT_ID --role acrpull --scope $ACR_ID
az acr login -n $registryName


# Install Dapr
Write-Host
Write-Host "Installing Dapr on $clusterName..."
dapr init --kubernetes

Write-Host
Write-Host "Installing Redis as the Dapr state store on $clusterName..."
helm install stable/redis --name redis --set image.tag=5.0.5-debian-9-r104 --set rbac.create=true
Start-Sleep -Seconds 60

$redisHost= $(kubectl get service redis-master -o=custom-columns=IP:.spec.clusterIP --no-headers=true) + ":6379"

$encoded = kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}"
$redisSecret = [System.Text.Encoding]::ASCII.GetString([System.Convert]::FromBase64String($encoded))

(Get-Content $setupFolder/redis-base.yaml) | Foreach-Object {$_ -replace "REPLACE_HOST", $redisHost} | Foreach-Object {$_ -replace "REPLACE_SECRET", $redisSecret} | Set-Content $deployFolder/redis.yaml


# Install KEDA
Write-Host
Write-Host "Installing KEDA on $clusterName..."
func kubernetes install --namespace keda

#### Application section

# Provision Azure Storage
Write-Host
Write-Host "Creating storage account $storageName..."
az group create -l $location -n $groupName
az storage account create --sku Standard_LRS -l $location -g $groupName -n $storageName --kind StorageV2                                   
$CONNECTION_STRING= az storage account show-connection-string -g $groupName -n $storageName --query connectionString         
az storage queue create -n items --connection-string $CONNECTION_STRING

# Build images and deployment templates
Write-Host
Write-Host "Building and publishing images..."

$trimmedConnectionString = $CONNECTION_STRING -replace "`"", ""
$encodedConnectionString = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($trimmedConnectionString))

(Get-Content $setupFolder/python-function-publisher-base.yaml) `
| Foreach-Object {$_ -replace "IMAGE_NAME", "$registryName.azurecr.io/$pythonName"}  `
| Foreach-Object {$_ -replace "CONNECTION_STRING_B64", $encodedConnectionString}  `
| Set-Content $deployFolder/python-function-publisher.yaml
                                          
docker build -t "$registryName.azurecr.io/$pythonName" $pythonFolder  
docker push "$registryName.azurecr.io/$pythonName"              

(Get-Content $setupFolder/csharp-function-subscriber-base.yaml) `
| Foreach-Object {$_ -replace "IMAGE_NAME", "$registryName.azurecr.io/$dotnetName"}  `
| Foreach-Object {$_ -replace "CONNECTION_STRING_B64", $encodedConnectionString}  `
| Set-Content $deployFolder/csharp-function-subscriber.yaml
                                        
docker build -t "$registryName.azurecr.io/$dotnetName" $dotnetFolder  
docker push "$registryName.azurecr.io/$dotnetName"

(Get-Content $setupFolder/javascript-function-subscriber-base.yaml) `
| Foreach-Object {$_ -replace "IMAGE_NAME", "$registryName.azurecr.io/$javascriptName"}  `
| Foreach-Object {$_ -replace "CONNECTION_STRING_B64", $encodedConnectionString}  `
| Set-Content $deployFolder/javascript-function-subscriber.yaml

docker build -t "$registryName.azurecr.io/$javascriptName" $javascriptFolder  
docker push "$registryName.azurecr.io/$javascriptName"

# Deploy
Write-Host
Write-Host "Deploying application..."
kubectl apply -f $deployFolder