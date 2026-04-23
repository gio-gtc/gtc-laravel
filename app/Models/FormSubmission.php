<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_template_id',
        'venue_id',
        'order_id',
        'tour_venue_id',
        'user_id',
        'answers',
        'meta',
        'submitted_at',
    ];

    protected $casts = [
        'answers' => 'array',
        'meta' => 'array',
        'submitted_at' => 'datetime',
        'order_id' => 'integer',
        'tour_venue_id' => 'integer',
    ];

    public function formTemplate(): BelongsTo
    {
        return $this->belongsTo(FormTemplate::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answerRows(): HasMany
    {
        return $this->hasMany(FormAnswer::class);
    }
}
