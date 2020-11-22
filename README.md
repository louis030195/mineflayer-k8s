# mineflayer-troll

[![Build Status](https://github.com/louis030195/mineflayer-troll/workflows/CI/badge.svg)](https://github.com/louis030195/mineflayer-troll/actions?query=workflow%3A%22CI%22)
[![Docker Status](https://github.com/louis030195/mineflayer-troll/workflows/CI/badge.svg)](https://github.com/louis030195/mineflayer-troll/actions?query=workflow%3A%22Docker%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/louis030195/mineflayer-troll)

A Mineflayer example bot runnable as a [baremetal process](https://nodejs.org/en/), as a [Docker container](https://www.docker.com/) or as a [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/).

If you're lucky mineflayer-troll(s) are running on **109.210.246.114:30018** Minecraft server running in a Kubernetes cluster running on a Raspberry PI (deep learning plugins are off, couldn't make TFJS work yet on ARM).

## Usage

```make
louis@louis-pc:~/Documents/mineflayer-troll$ make help
usage: make [target] ...

Variables:
TAG: Docker tag, default "TAG ?= 0.0.5"
CONFIG: path to application config file, default "CONFIG ?= setting.json"

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

* [make](https://www.gnu.org/software/make/manual/make.html)
* [nodejs](https://nodejs.org/en/)

### Default settings

Using [default settings](./default.json)

```bash
make online
```

### With custom settings

```bash
CONFIG=./setting.json make deploy
```

## Run as Docker container

### Dependencies

* [make](https://www.gnu.org/software/make/manual/make.html)
* [docker](https://www.docker.com/)
* Supported OS/ARCH see [tags](https://hub.docker.com/r/louis030195/mineflayer-troll/tags), I personally run this on my Raspberry PI 4B

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

* [make](https://www.gnu.org/software/make/manual/make.html)
* A [k8s](https://kubernetes.io/) cluster running and configured
* [jq](https://stedolan.github.io/jq/)
* [helm](https://helm.sh/)

### Default settings

Using [default settings](./default.json)

```bash
make deploy_k8s
```

### With custom settings

```bash
CONFIG=./setting.json make deploy_k8s
```

## Deploy a externally accessible Minecraft server on your k8s cluster

1. Port-forward <port between 30000 and 31000 (k8s allowed)> TCP, Kubernetes API (6443) TCP
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

* `Could not resolve host: launchermeta.mojang.com` - [see issue](https://github.com/itzg/docker-minecraft-server/issues/317#issuecomment-507498422)

    ```bash
    kubectl edit deployment/minecraft-server-minecraft
    dnsPolicy: "None"
    dnsConfig:
      nameservers:
        - 8.8.8.8
    ```
