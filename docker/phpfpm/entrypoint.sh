php bin/console cache:warmup
retCacheWarmer=$?
if [ $retCacheWarmer -eq 1 ]; then
  echo "cannot get cache warmer, exiting"
  exit $retCacheWarmer
fi

echo "entrypoint success"