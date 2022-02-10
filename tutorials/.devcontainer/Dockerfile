# ------------------------------------------------------------
# Copyright (c) Microsoft Corporation and Dapr Contributors.
# Licensed under the MIT License.
# ------------------------------------------------------------

FROM mcr.microsoft.com/vscode/devcontainers/universal:1-focal

# Copy custom first notice message.
COPY first-run-notice.txt /tmp/staging/
RUN sudo mv -f /tmp/staging/first-run-notice.txt /usr/local/etc/vscode-dev-containers/ \
    && sudo rm -rf /tmp/staging

# Install minikube
RUN MINIKUBE_URL="https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64" \
    && sudo curl -sSL -o /usr/local/bin/minikube "${MINIKUBE_URL}" \
    && sudo chmod 0755 /usr/local/bin/minikube \
    && MINIKUBE_SHA256=$(curl -sSL "${MINIKUBE_URL}.sha256") \
    && echo "${MINIKUBE_SHA256} */usr/local/bin/minikube" | sha256sum -c -

# Install Dapr CLI
RUN wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Install mechanical-markdown for quickstart validations
RUN pip install mechanical-markdown
