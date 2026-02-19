# 1. Use the official PHP Apache image
FROM php:8.2-apache

# 2. Install necessary PHP extensions for Laravel & TiDB/Supabase
RUN apt-get update && apt-get install -y libzip-dev zip unzip git \
    && docker-php-ext-install pdo_mysql pdo_pgsql zip

# 3. Enable Apache URL rewrites (Crucial for Laravel routes)
RUN a2enmod rewrite

# 4. Tell Apache to serve the "public" folder, not the root folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# 5. Copy your code into the server
COPY . /var/www/html

# 6. Install Composer and run it
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# 7. Give Laravel permission to write to storage and cache folders
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache