FROM ghcr.io/jymarkb/symfony-blog-phpfpm as phpfpm

FROM nginx:stable-alpine

ARG PHP_FPM_IMAGE
# Copy built assets from the PHP-FPM image
COPY --from=phpfpm /www/public /www/public

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]