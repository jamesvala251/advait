<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TruckExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'truck_id',
        'expense_type',
        'date',
        'amount',
        'details'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }
} 