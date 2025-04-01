FROM nginx:stable-alpine

COPY --from=ghcr.io/jymarkb/symfony-blog-phpfpm /www/public /www/public

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]