#!/bin/sh

# Install dapr CLI
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Initialize Dapr
dapr init
