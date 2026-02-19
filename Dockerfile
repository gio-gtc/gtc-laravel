# 1. Use the official PHP Apache image
FROM php:8.2-apache

# 2. Install required system packages, PostgreSQL headers, PHP extensions, and Node.js
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip git curl libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo_mysql pdo_pgsql zip

# 3. Enable Apache URL rewrites (Crucial for Laravel routes)
RUN a2enmod rewrite

# 4. Tell Apache to serve the "public" folder instead of the root folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Set the working directory and copy your code in
WORKDIR /var/www/html
COPY . /var/www/html

# 6. Install Composer and run it
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# 7. Build React/Vite frontend assets
RUN npm install
RUN npm run build

# 8. Give Laravel permission to write to its own folders
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache