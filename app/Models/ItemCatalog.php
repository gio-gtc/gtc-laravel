<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemCatalog extends Model
{
    protected $table = 'item_catalog';

    protected $fillable = [
        'key',
        'name',
        'platform',
        'width',
        'height',
        'unit',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'width' => 'integer',
        'height' => 'integer',
    ];
}
