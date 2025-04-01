# Use build arguments to dynamically set the PHP-FPM image tag
ARG PHP_FPM_TAG

# Pull the correct PHP-FPM image based on the commit tag
FROM ghcr.io/jymarkb/symfony-blog-phpfpm:${PHP_FPM_TAG} as phpfpm

FROM nginx:stable-alpine

COPY --from=phpfpm /www/public /www/public

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]