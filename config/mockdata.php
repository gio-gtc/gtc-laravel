<?php

$catalogPath = __DIR__.'/mockdata/generated/catalog.json';
$homepagePath = __DIR__.'/mockdata/generated/homepage.json';
$usersPath = __DIR__.'/mockdata/generated/users.json';
$toursPath = __DIR__.'/mockdata/generated/tours.json';
$toursVenuesPath = __DIR__.'/mockdata/generated/toursVenues.json';
$venueItemsPath = __DIR__.'/mockdata/generated/venueItems.json';
$venuesPath = __DIR__.'/mockdata/generated/venues.json';

if (! is_file($catalogPath)) {
    throw new RuntimeException(
        'Missing demo catalog at config/mockdata/generated/catalog.json.'
    );
}

if (! is_file($homepagePath)) {
    throw new RuntimeException(
        'Missing demo data at config/mockdata/generated/homepage.json.'
    );
}

if (! is_file($usersPath)) {
    throw new RuntimeException(
        'Missing demo data at config/mockdata/generated/users.json.'
    );
}

if (! is_file($toursPath)) {
    throw new RuntimeException(
        'Missing demo data at config/mockdata/generated/tours.json.'
    );
}

if (! is_file($toursVenuesPath)) {
    throw new RuntimeException(
        'Missing demo data at config/mockdata/generated/toursVenues.json.'
    );
}

if (! is_file($venueItemsPath)) {
    throw new RuntimeException(
        'Missing demo data at config/mockdata/generated/venueItems.json.'
    );
}

if (! is_file($venuesPath)) {
    throw new RuntimeException(
        'Missing demo data at config/mockdata/generated/venues.json.'
    );
}


/** @var array<string, mixed> $catalog */
$catalog = json_decode(file_get_contents($catalogPath), true, 512, JSON_THROW_ON_ERROR);

/** @var array<int, array<string, mixed>> $homepage */
$homepage = json_decode(file_get_contents($homepagePath), true, 512, JSON_THROW_ON_ERROR);


/** @var array<int, array<string, mixed>> $users */
$users = json_decode(file_get_contents($usersPath), true, 512, JSON_THROW_ON_ERROR);

/** @var array<int, array<string, mixed>> $tours */
$tours = json_decode(file_get_contents($toursPath), true, 512, JSON_THROW_ON_ERROR);

/** @var array<int, array<string, mixed>> $toursVenues */
$toursVenues = json_decode(file_get_contents($toursVenuesPath), true, 512, JSON_THROW_ON_ERROR);

/** @var array<int, array<string, mixed>> $venueItems */
$venueItems = json_decode(file_get_contents($venueItemsPath), true, 512, JSON_THROW_ON_ERROR);

/** @var array<int, array<string, mixed>> $venues */
$venues = json_decode(file_get_contents($venuesPath), true, 512, JSON_THROW_ON_ERROR);


return array_merge(
    [
        'demos' => require __DIR__.'/mockdata/demos.php',
    ],
    $catalog,
    $homepage,
    $users,
    $tours,
    $toursVenues,
    $venueItems,
    $venues
);
