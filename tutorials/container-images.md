# Build and publish tutorial container images

The tutorials below define applications in their `makefile` and use the shared [Docker targets](docker.mk). Run the commands from the tutorial directory, where the application folders and Dockerfiles are located.

| Tutorial | Applications (`APPS`) | Image prefix (`DOCKER_IMAGE_PREFIX`) |
| --- | --- | --- |
| [Hello Kubernetes](hello-kubernetes/README.md) | `node python` | `hello-k8s-` |
| [Distributed calculator](distributed-calculator/README.md) | `node python go csharp react-calculator` | `distributed-calculator-` |
| [Publish and subscribe](pub-sub/README.md) | `node-subscriber python-subscriber csharp-subscriber react-form` | `pubsub-` |
| [Bindings](bindings/README.md) | `nodeapp pythonapp` | `bindings-` |
| [Observability](observability/README.md) | `python` | `distributed-calculator-slow-` |
| [Secret store](secretstore/README.md) | `node` | `secretstore` |

Including the repository-root `docker.mk` alone does not configure image builds: a sample also needs `APPS` and a Dockerfile for each application. The commands below apply to the tutorials in this table.

## Prerequisites

- GNU Make, Bash, and Docker with a running engine capable of building Linux containers.
- A container registry namespace you can push to. The examples use Docker Hub; replace `YOUR_DOCKERHUB_USERNAME` with your namespace.
- Any application build prerequisites described in the tutorial. For example, the distributed calculator builds its C# application with `dotnet` before building the container image.

## Build and push images

From the repository root, open the Hello Kubernetes tutorial and select your registry and version. These Bash environment variables apply to the subsequent `make` commands:

```bash
cd tutorials/hello-kubernetes
export SAMPLE_REGISTRY=docker.io/YOUR_DOCKERHUB_USERNAME
export REL_VERSION=dev
```

The shared defaults are `SAMPLE_REGISTRY=docker.io/dapriosamples`, `REL_VERSION=latest`, `TARGET_OS=linux`, and `TARGET_ARCH=amd64`. Use your own registry namespace when publishing.

Preview the build commands with `-n`, then build the images:

```bash
make -n build TARGET_OS=linux TARGET_ARCH=amd64
make build TARGET_OS=linux TARGET_ARCH=amd64
```

An image is named `<SAMPLE_REGISTRY>/<DOCKER_IMAGE_PREFIX><app>:<REL_VERSION>-<TARGET_OS>-<TARGET_ARCH>`. For example, the Node.js image is `docker.io/YOUR_DOCKERHUB_USERNAME/hello-k8s-node:dev-linux-amd64`.

Authenticate to Docker Hub and push the images you built:

```bash
docker login
make push TARGET_OS=linux TARGET_ARCH=amd64
```

For another registry, set `SAMPLE_REGISTRY` to its host and namespace and use `docker login <registry-host>`.

Each aggregate target runs once per application in `APPS`. To select one application, use its generated target, for example `make build-node` and `make push-node`, with the same OS and architecture settings.

## Create and publish image manifests

A Docker image manifest associates a version tag with architecture-specific images. It is separate from a Kubernetes Deployment or Service YAML file.

After pushing the `linux-amd64` images above, create and publish version tags containing that architecture:

```bash
make manifest-create DOCKERMUTI_ARCH=linux-amd64
make manifest-push
```

`DOCKERMUTI_ARCH` is the variable name used by the Makefile. Its default is `linux-amd64 linux-arm linux-arm64`; every referenced image must already exist in the registry before creating the manifest.

To publish a multi-architecture version, first configure Docker to build the target architectures (including emulation when needed). Use a new version tag to avoid reusing the local manifest created above, then build and push all three:

```bash
export REL_VERSION=dev-multiarch
for arch in amd64 arm arm64; do
  make build TARGET_OS=linux TARGET_ARCH="$arch"
  make push TARGET_OS=linux TARGET_ARCH="$arch"
done
make manifest-create
make manifest-push
```

For Hello Kubernetes, the resulting multi-architecture tags are `docker.io/YOUR_DOCKERHUB_USERNAME/hello-k8s-node:dev-multiarch` and `docker.io/YOUR_DOCKERHUB_USERNAME/hello-k8s-python:dev-multiarch`.

Update the `image:` values in the tutorial's Kubernetes deployment YAML files to your published image tags, then follow that tutorial's deployment instructions. These Make targets publish container images; they do not generate Kubernetes YAML files.

## How the Make targets are generated

The names in the shared Makefile are macros, rather than commands to pass to `make`:

| Makefile macro | Aggregate target | Per-application target |
| --- | --- | --- |
| `genDockerImageBuild` | `make build` | `make build-<app>` |
| `genDockerImagePush` | `make push` | `make push-<app>` |
| `genDockerManifestCreate` | `make manifest-create` | `make manifest-create-<app>` |
| `genDockerManifestPush` | `make manifest-push` | `make manifest-push-<app>` |

Use `make -n <target>` to inspect the commands and image names before running a target. These are the same aggregate targets used by the [Build Quickstarts workflow](../.github/workflows/build.yml).
