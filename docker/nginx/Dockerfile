FROM nginx:stable-alpine

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

WORKDIR /www

# Copy application files to the container
COPY ./app /www/app
COPY ./public /www/public
COPY ./src /www/src

CMD ["nginx", "-g", "daemon off;"]