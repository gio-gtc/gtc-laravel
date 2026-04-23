<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockDefinition extends Model
{
    protected $fillable = [
        'key',
        'name',
        'kind',
        'schema',
        'embeds',
        'version',
    ];

    protected $casts = [
        'schema' => 'array',
        'embeds' => 'array',
        'version' => 'integer',
    ];

    public const KIND_ITEM_LIST = 'item_list';

    public const KIND_CTA_SELECTOR = 'cta_selector';

    public const KIND_CUSTOM_SIZES = 'custom_sizes';

    public const KIND_ORDER_INFO = 'order_info';
}
