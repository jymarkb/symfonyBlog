#!/bin/sh
set -ex

echo "Warming up cache"
mkdir -p /www/var
chmod -R 777 /www/var

# Warmup cache
php bin/console cache:clear --env=prod --no-warmup
php bin/console cache:warmup --env=prod

echo "Entrypoint success"

exec "$@"
