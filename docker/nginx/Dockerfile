FROM node:20 AS asset-build

WORKDIR /www

COPY package.json yarn.lock /www/

RUN yarn install 

COPY tsconfig.json postcss.config.js webpack.config.js tailwind.config.js /www/
COPY ./app/Resources/ /www/app/Resources/
COPY ./assets/ /www/assets/

RUN yarn run build

FROM nginx:stable-alpine

WORKDIR /www

COPY --from=asset-build /www/public /www/public

COPY ./docker/nginx/certs/ /etc/nginx/certs/
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]