<?php

$catalogPath = __DIR__.'/mockdata/generated/catalog.json';

if (! is_file($catalogPath)) {
    throw new RuntimeException(
        'Missing demo catalog at config/mockdata/generated/catalog.json.'
    );
}

/** @var array<string, mixed> $catalog */
$catalog = json_decode(file_get_contents($catalogPath), true, 512, JSON_THROW_ON_ERROR);

return array_merge(
    [
        'demos' => require __DIR__.'/mockdata/demos.php',
    ],
    $catalog
);
