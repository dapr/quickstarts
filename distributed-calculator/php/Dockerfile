FROM php:8-cli AS base
RUN apt-get update && apt-get install -y wget libzip-dev libonig-dev libcurl4-openssl-dev git && apt-get clean
RUN docker-php-ext-install curl zip
WORKDIR /app
EXPOSE 3000

FROM base AS composer
RUN wget https://raw.githubusercontent.com/composer/getcomposer.org/bfd95e2a4383ee9cf7c058c2df29d7acb5f86d77/web/installer -O - -q | php -- --quiet && \
    mv composer.phar /usr/bin/composer && \
    chmod +x /usr/bin/composer
COPY composer.json /app/composer.json
COPY composer.lock /app/composer.lock
RUN composer install --no-dev -o -n

FROM base AS service
COPY . .
COPY --from=composer /app/vendor /app/vendor
ENTRYPOINT ['php']
CMD ["-S", "0.0.0.0:3000", "-t", "/app"]
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
