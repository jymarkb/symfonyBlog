FROM nginx:stable-alpine

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

COPY --chown=www-data:www-data ./public /www/public
COPY --from=symfony-blog-phpfpm /www/public /www/public

CMD ["nginx", "-g", "daemon off;"]