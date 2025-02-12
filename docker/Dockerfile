FROM composer:lts as composer-build

WORKDIR /www

ADD ./ /www

RUN composer install --prefer-dist --no-scripts --ignore-platform-reqs

FROM php:8.2-fpm AS final

RUN apt-get update && apt-get install -y \
    libicu-dev \
    && docker-php-ext-install pdo pdo_mysql intl \
    && docker-php-ext-enable intl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /www
ADD ./ /www

COPY --from=composer-build /www/vendor/ /www/vendor/

RUN rm -rf /www/var/cache/* && \
    rm -rf /www/var/logs/*

RUN touch ./.env

VOLUME ["/www"]
