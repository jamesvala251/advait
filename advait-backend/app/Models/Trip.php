<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'truck_id',
        'driver_id',
        'origin',
        'destination',
        'start_date',
        'end_date',
        'distance',
        'fuel_consumed',
        'status',
        'trip_number',
        'party_name',
        'compressor',
        'start_km',
        'end_km',
        'diesel_amount',
        'toll',
        'driver_salary',
        'advanced_salary',
        'maintenance',
        'freight',
        'weight',
        'total_freight',
        'total_km',
        'total_expenses',
        'total_profit',
        'per_day_profit'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'distance' => 'decimal:2',
        'fuel_consumed' => 'decimal:2',
        'start_km' => 'decimal:2',
        'end_km' => 'decimal:2',
        'diesel_amount' => 'decimal:2',
        'toll' => 'decimal:2',
        'driver_salary' => 'decimal:2',
        'advanced_salary' => 'decimal:2',
        'maintenance' => 'decimal:2',
        'freight' => 'decimal:2',
        'weight' => 'decimal:2',
        'total_freight' => 'decimal:2',
        'total_km' => 'decimal:2',
        'total_expenses' => 'decimal:2',
        'total_profit' => 'decimal:2',
        'per_day_profit' => 'decimal:2'
    ];

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
