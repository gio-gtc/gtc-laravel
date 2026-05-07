<?php

$ordersPath = __DIR__.'/mockdata/generated/orders.json';
$homepagePath = __DIR__.'/mockdata/generated/homepage.json';
$usersPath = __DIR__.'/mockdata/generated/users.json';
$toursPath = __DIR__.'/mockdata/generated/tours.json';
$toursVenuesPath = __DIR__.'/mockdata/generated/toursVenues.json';
$venueItemsPath = __DIR__.'/mockdata/generated/venueItems.json';
$venuesPath = __DIR__.'/mockdata/generated/venues.json';
$countriesPath = __DIR__.'/mockdata/generated/countries.json';
$organisationsPath = __DIR__.'/mockdata/generated/organisations.json';
$invoicesPath = __DIR__.'/mockdata/generated/invoices.json';


/** @var array<string, mixed> $orders */
$orders = json_decode(file_get_contents($ordersPath), true, 512, JSON_THROW_ON_ERROR);

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

/** @var array<int, array<string, mixed>> $countries */
$countries = json_decode(file_get_contents($countriesPath), true, 512, JSON_THROW_ON_ERROR);

/** @var array<string, mixed> $organisationsDecoded */
$organisationsData = json_decode(file_get_contents($organisationsPath), true, 512, JSON_THROW_ON_ERROR);

/** @var array<int, array<string, mixed>> $invoices */
$invoices = json_decode(file_get_contents($invoicesPath), true, 512, JSON_THROW_ON_ERROR);


return array_merge(
    $orders,
    $homepage,
    $users,
    $tours,
    $toursVenues,
    $venueItems,
    $venues,
    $countries,
    $organisationsData,
    $invoices
);
