#!/bin/sh
set -e

# Ensure /www/var exists
mkdir -p /www/var

# Set correct ownership and permissions for /www/var
# chown -R www-data:www-data /www/var
chmod -R 777 /www/var

echo "Permissions for /www/var fixed."

# Warmup cache
php bin/console cache:clear --env=prod --no-warmup
php bin/console cache:warmup --env=prod

echo "Entrypoint success"

exec "$@"
