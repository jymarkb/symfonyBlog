FROM nginx:stable-alpine

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

COPY --chown=www-data:www-data ./public /www/public
WORKDIR /www

COPY package.json yarn.lock tsconfig.json postcss.config.js webpack.config.js tailwind.config.js /www/

RUN yarn install --frozen-lockfile

CMD ["nginx", "-g", "daemon off;"]