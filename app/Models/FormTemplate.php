<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormTemplate extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'layout',
        'version',
        'is_active',
    ];

    protected $casts = [
        'layout' => 'array',
        'version' => 'integer',
        'is_active' => 'boolean',
    ];

    public function venueForms(): HasMany
    {
        return $this->hasMany(VenueForm::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
