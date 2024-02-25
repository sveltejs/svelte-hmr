#!/bin/bash

# Mount a tmpfs on playground-tmp directory.
#
# This is entirely optional. The point is to save write cycles on your disk.
#
# Usage:
#
#   export TMP_PLAYGROUND_DIR=playground-tmp
#   ./mount-tmp-playground.sh
#   cd playground
#   pnpm test
#

TMP_PLAYGROUND_DIR=${TMP_PLAYGROUND_DIR:-"playground-tmp"}

if [ "$1" == "-u" ] || [ "$1" == "--unmount" ]; then
  umount "$TMP_PLAYGROUND_DIR"
else
  mkdir -p "$TMP_PLAYGROUND_DIR"
  mount -o size=16G -t tmpfs none playground-tmp
fi
