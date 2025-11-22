<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverSalary extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'date',
        'advanced_salary',
        'remarks'
    ];

    protected $casts = [
        'date' => 'date',
        'advanced_salary' => 'decimal:2'
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
