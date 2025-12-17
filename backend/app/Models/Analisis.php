<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Analisis extends Model
{
    use HasFactory;

    protected $table = 'analisis';
    protected $fillable = [
        'reference',
        'title',
        'status',
        'category',
        'monto_credito',
        'lead_id',
        'opportunity_id',
        'assigned_to',
        'opened_at',
        'description',
        'divisa',
        'plazo',
    ];

    protected $casts = [
        'opened_at' => 'date',
        'monto_credito' => 'decimal:2',
        'plazo' => 'integer',
    ];

    // Relationships (if needed)
    public function lead() { return $this->belongsTo(Lead::class); }
     public function opportunity() { return $this->belongsTo(Opportunity::class); }
}
