php bin/console cache:warmup
retCacheWarmer=$?
if [ $retCacheWarmer -eq 1 ]; then
  echo "cannot get cache warmer, exiting"
  exit $retCacheWarmer
fi

chmod -R 777 /www/var

if [[ -z "$RUN_COMMAND" ]]; then
  echo "Starting $@...."
  exec "$@"
else
  echo "Running console command...."
  echo "\n"
  printenv
  echo "\n"
  php /www/bin/console $RUN_COMMAND
  CODE=$?
  exit ${CODE}
fi

echo "entrypoint success"