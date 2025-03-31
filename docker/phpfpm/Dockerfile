FROM composer:lts AS composer-build

WORKDIR /www

COPY composer.json composer.lock /www/

RUN composer install --prefer-dist --no-scripts --ignore-platform-reqs

ADD ./ /www

FROM node:20 AS asset-build

WORKDIR /www

COPY package.json yarn.lock tsconfig.json postcss.config.js webpack.config.js tailwind.config.js /www/

RUN yarn install --frozen-lockfile

ADD ./app/Resources/ /www/app/Resources/
ADD ./templates/ /www/templates/
ADD ./assets/ /www/assets/

RUN yarn run build

FROM php:8.2-fpm AS final

RUN apt-get update && apt-get install -y \
    libicu-dev \
    && docker-php-ext-install pdo pdo_mysql intl \
    && docker-php-ext-enable intl \
    && rm -rf /var/lib/apt/lists/*

COPY ./docker/phpfpm/php.ini /usr/local/etc/php/conf.d/

WORKDIR /www
ADD ./ /www

COPY --from=composer-build /www/vendor/ /www/vendor/
COPY --from=asset-build /www/public/ /www/public/

RUN rm -rf /www/var/cache/* && \
    rm -rf /www/var/logs/*

RUN touch ./.env

ADD ./docker/phpfpm/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/www"]