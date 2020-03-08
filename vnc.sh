#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Remove VNC lock (if process already killed)
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1

# disable firefox updates
cat hosts >> /etc/hosts

# start vnc server
vncserver :1 -geometry $RESOLUTION -depth $DEPTH
export DISPLAY=:1
startlxde &

# start firefox
/firefox/firefox --display=':1'

# stop the vnc server when user exits firefox, container will stop
vncserver -kill :1
