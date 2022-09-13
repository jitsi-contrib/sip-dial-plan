#!/bin/bash
set -e

BASEDIR=$(dirname $0)

deno run --allow-net --allow-read $BASEDIR/sip-dial-plan.ts
