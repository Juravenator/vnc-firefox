FROM ubuntu:18.04

MAINTAINER Juravenator <glenn.dirkx@gmail.com>

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
  lxde-core \
  lxterminal \
  tightvncserver \
  xrdp \
  curl

# Set default password
COPY password.txt .
# vncpasswd asks for the new password twice
RUN cat password.txt password.txt | vncpasswd
# Expose VNC port
EXPOSE 5901

# Set XDRP to use TightVNC port
RUN sed -i '0,/port=-1/{s/port=-1/port=5901/}' /etc/xrdp/xrdp.ini

# Copy VNC script that handles restarts
COPY vnc.sh /opt/

ARG FIREFOX_VERSION
COPY hosts .
COPY firefox.desktop /root/Desktop/firefox.desktop
RUN curl -SL "https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/en-GB/firefox-$FIREFOX_VERSION.tar.bz2" | tar -xj && \
    sed -i "/Name=/c\Name=Firefox $FIREFOX_VERSION" /root/Desktop/firefox.desktop

# user for VNC server
ENV USER root
# screen resolution
ENV RESOLUTION 1280x800
# screen color depth
ENV DEPTH 24

CMD ["/opt/vnc.sh"]
