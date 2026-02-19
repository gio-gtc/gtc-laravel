# 1. Use the official PHP Apache image
FROM php:8.2-apache

# 2. Allow Composer to run as root without throwing errors
ENV COMPOSER_ALLOW_SUPERUSER=1

# 3. Install required system packages, PostgreSQL headers, PHP extensions, and Node.js
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip git curl libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo_mysql pdo_pgsql zip

# 4. Enable Apache URL rewrites (Crucial for Laravel routes)
RUN a2enmod rewrite

# 5. Tell Apache to serve the "public" folder instead of the root folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 6. Set the working directory and copy your code in
WORKDIR /var/www/html
COPY . /var/www/html

# 7. Grab Composer safely from the official Docker image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 8. Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

# 9. INJECT RENDER VARIABLES INTO DOCKER BUILD
# This pulls the variables from the Render Dashboard through the Docker wall
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_ANON_KEY

# This assigns them to the environment so Vite can see them
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# 10. Build React/Vite frontend assets
RUN npm install
RUN npm run build

# 11. Give Laravel permission to write to its own folders
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache