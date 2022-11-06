FROM php:7.4-apache

WORKDIR /var/www/html
# RUN apt-get update \
#  && apt-get install -y --no-install-recommends git unzip \
#  && rm -rf /var/lib/apt/lists

# RUN curl -sL https://getcomposer.org/installer > /tmp/composer-setup.php \
#  && php /tmp/composer-setup.php --install-dir=/usr/bin --filename=composer \
# && composer require psr/http-client \
# && composer require psr/http-client-implementation \
# && composer require psr/http-factory \
# && composer require psr/http-message \
# && composer require facile-it/php-openid-client

COPY src/ /var/www/html/
