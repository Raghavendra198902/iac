#!/bin/sh
wget --no-verbose --tries=1 --spider http://localhost:8400/health || exit 1
