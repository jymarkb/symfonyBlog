FROM nginx:stable-alpine

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

COPY --chown=www-data:www-data ./public /www/public

FROM node:20 AS asset-build
WORKDIR /www

COPY package.json yarn.lock tsconfig.json postcss.config.js webpack.config.js tailwind.config.js /www/

RUN yarn install
RUN yarn run build

CMD ["nginx", "-g", "daemon off;"]