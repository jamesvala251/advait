<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'expense_type',
        'amount',
        'date',
        'description',
        'payment_method',
        'reference_number'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
