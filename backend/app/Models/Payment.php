<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'id',
        'monto',
        'cedula'
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Get the Lead associated with this payment by cedula.
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class, 'cedula', 'cedula');
    }

    /**
     * Get the Credit associated with this payment's lead (if any).
     * Returns the first credit found for the lead.
     */
    public function credit()
    {
        $lead = $this->lead;
        if ($lead) {
            return Credit::where('lead_id', $lead->id)->first();
        }
        return null;
    }
}
