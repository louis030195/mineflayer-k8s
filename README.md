# mineflayer-k8s

![Docker](https://github.com/louis030195/mineflayer-k8s/workflows/Docker/badge.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/louis030195/mineflayer-k8s)
![Docker Image Size (tag)](https://img.shields.io/docker/image-size/louis030195/mineflayer-k8s/latest)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/louis030195/mineflayer-k8s)

A Mineflayer example bot runnable as a [baremetal process](https://nodejs.org/en/), as a [Docker container](https://www.docker.com/) or as a [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/).

![deploy a mineflayer-k8s](docs/images/deploy.gif)

---

![multi mineflayer-k8s](docs/images/multi.gif)

---

Detect toxic players using [TensorflowJS](https://github.com/tensorflow/tfjs)

![toxic](docs/images/toxic.gif)

If you're lucky mineflayer-k8s(s) are running on **91.121.67.56:30018** Minecraft server running in a Kubernetes cluster running on a Raspberry PI.

## Viewer

You can interactively see what your bot is doing using [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) in the web.  
See example [here](91.121.67.56:30019)
You can disable this feature easily by adding viewer to the disabled plugins (or any plugins in the plugins directory) in the configuration:

```json
"disabledPlugins": ["viewer"]
```

![viewer](docs/images/viewer.gif)

## Node dependencies

- [mineflayer](https://github.com/PrismarineJS/mineflayer), [mineflayer-cmd](https://github.com/PrismarineJS/mineflayer-cmd), [mineflayer-pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder), [mineflayer-pvp](https://github.com/PrismarineJS/mineflayer-pvp), [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) (Minecraft bots)
- [@tensorflow/tfjs-node](https://github.com/tensorflow/tfjs), @tensorflow/tfjs, [@tensorflow-models/toxicity](https://github.com/tensorflow/tfjs-models) (deep learning)
- [winston](https://github.com/winstonjs/winston) (logging)
- [yargs](https://github.com/yargs/yargs) (arguments)

## Usage

If you want to use Kubernetes and know it plus Helm, just jump directly to the [values](helm/values.yaml).

```make
louis@louis-pc:~/Documents/mineflayer-k8s$ make help
usage: make [target] ...

Variables:
TAG: Docker tag, default "TAG ?= 0.1.4"
CONFIG: path to application config file, default "CONFIG ?= setting.json"
SERVER_CONFIG: path to minecraft server config file, default "SERVER_CONFIG ?= server-values.yaml"

Targets:
help                   Display this help
build_push             Build and push on DockerHub multiarch Docker image (need Docker buildx)
deploy                 Deploy as a baremetal process
deploy_docker          Deploy as a Docker container
deploy_k8s             Deploy as a Kubernetes Deployment
deploy_k8s_server      Deploy a github.comitzg/minecraft-server-charts on Kubernetes
```

## Run as nodejs process

### Dependencies

- [make](https://www.gnu.org/software/make/manual/make.html)
- [nodejs](https://nodejs.org/en/)

### Default settings

Using [default settings](./default.json)

```bash
make deploy
```

### With custom settings

```bash
CONFIG=./setting.json make deploy
```

## Run as Docker container

### Dependencies

- [make](https://www.gnu.org/software/make/manual/make.html)
- [docker](https://www.docker.com/)
- Supported OS/ARCH see [tags](https://hub.docker.com/r/louis030195/mineflayer-k8s/tags), I personally run this on my Raspberry PI 4B

### Default settings

Using [default settings](./default.json)

```bash
make deploy_docker
```

### With custom settings

```bash
CONFIG=./setting.json make deploy_docker
```

## Run as Kubernetes Deployment

### Dependencies

- [make](https://www.gnu.org/software/make/manual/make.html)
- A [k8s](https://kubernetes.io/) cluster running and configured
- [jq](https://stedolan.github.io/jq/)
- [helm](https://helm.sh/)

### Default settings

Using [default settings](./default.json)

```bash
make deploy_k8s
```

### With custom settings

```bash
RELEASE=mt1 CONFIG=./setting.json make deploy_k8s
```

#### Example Helm output

```bash
helm install mk helm -f helm/values-dev.yaml --dry-run --debug
```

>NOTES:
>mk connecting as foo to 109.210.246.114:30018, server running >version 1.16.4
>1. Get logs
>  kubectl logs -f -l app.kubernetes.io/instance=mk
>2. Watch your bot playing in the web using prismarine-viewer at 109.210.246.114:30019


## Deploy a externally accessible Minecraft server on your k8s cluster

1. Port-forward [port between 30000 and 31000 (k8s allowed)] TCP, Kubernetes API (6443) TCP
2. Assign a static IP
3. Use similar config for `make deploy_k8s_server`:

    ```yaml
    minecraftServer:
      eula: true
      version: "1.16.4"
      serviceType: LoadBalancer
      loadBalancerIP: <curl ifconfig.me on your k8s host>
      externalIPs:
        - <curl ifconfig.me on your k8s host>
      nodePort: <my port forwarded port>
    ```

### Troubleshoot

- `Could not resolve host: launchermeta.mojang.com` - [see issue](https://github.com/itzg/docker-minecraft-server/issues/317#issuecomment-507498422)

    ```bash
    kubectl edit deployment/minecraft-server-minecraft
    dnsPolicy: "None"
    dnsConfig:
      nameservers:
        - 8.8.8.8
    ```
