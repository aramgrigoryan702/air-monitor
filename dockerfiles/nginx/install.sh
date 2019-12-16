#!/usr/bin/env bash
set -e
source /pd_build/buildconfig

header "Installing Nginx, Openresty, Naxsi..."
run wget http://nginx.org/download/nginx-1.5.8.tar.gz
run wget https://github.com/nbs-system/naxsi/archive/1.9.11.tar.gz
run tar xvzf nginx-1.5.8.tar.gz
run tar xvzf naxsi-x.xx.tar.gz
run cd nginx-x.x.xx/
 ./configure --conf-path=/etc/nginx/nginx.conf --add-module=../naxsi-x.xx/naxsi_src/ \
 --error-log-path=/var/log/nginx/error.log --http-client-body-temp-path=/var/lib/nginx/body \
 --http-fastcgi-temp-path=/var/lib/nginx/fastcgi --http-log-path=/var/log/nginx/access.log \
 --http-proxy-temp-path=/var/lib/nginx/proxy --lock-path=/var/lock/nginx.lock \
 --pid-path=/var/run/nginx.pid --with-http_ssl_module \
 --without-mail_pop3_module --without-mail_smtp_module \
 --without-mail_imap_module --without-http_uwsgi_module \
 --without-http_scgi_module --with-ipv6 --prefix=/usr
 make
 make install
