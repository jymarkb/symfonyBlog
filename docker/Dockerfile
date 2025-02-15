FROM composer:lts as composer-build

WORKDIR /www

ADD ./ /www

RUN composer install --prefer-dist --no-scripts --ignore-platform-reqs

FROM node:20 as asset-build

WORKDIR /www

COPY ./package.json /www/
COPY ./tsconfig.json /www/
COPY ./postcss.config.js /www/
COPY ./webpack.config.js /www/
COPY ./tailwind.config.js /www/
ADD ./yarn.lock /www/

ADD ./app/Resources/ /www/app/Resources/
ADD ./templates/ /www/templates/
ADD ./assets/ /www/assets/

RUN yarn install
RUN yarn run build

FROM php:8.2-fpm AS final

RUN apt-get update && apt-get install -y \
    libicu-dev \
    && docker-php-ext-install pdo pdo_mysql intl \
    && docker-php-ext-enable intl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /www
ADD ./ /www

COPY --from=composer-build /www/vendor/ /www/vendor/
COPY --from=asset-build /www/public/ /www/public/

RUN rm -rf /www/var/cache/* && \
    rm -rf /www/var/logs/*

RUN touch ./.env

VOLUME ["/www"]
