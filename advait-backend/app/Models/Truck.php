<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Truck extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'truck_number',
        'model',
        'capacity',
        'status'
    ];

    protected $dates = ['deleted_at'];

    // Relationship with trips
    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
