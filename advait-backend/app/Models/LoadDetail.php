<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoadDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'truck_id',
        'location',
        'load_qty',
        'diesel_amount',
        'freight',
        'total_freight',
        'advance_payment',
        'commission',
        'balance_payment'
    ];

    protected $casts = [
        'date' => 'date',
        'load_qty' => 'decimal:2',
        'diesel_amount' => 'decimal:2',
        'freight' => 'decimal:2',
        'total_freight' => 'decimal:2',
        'advance_payment' => 'decimal:2',
        'commission' => 'decimal:2',
        'balance_payment' => 'decimal:2'
    ];

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }
} 