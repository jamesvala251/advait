<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('load_details', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('truck_id')->constrained('trucks')->onDelete('cascade');
            $table->string('location');
            $table->decimal('load_qty', 10, 2);
            $table->decimal('diesel_amount', 10, 2);
            $table->decimal('freight', 10, 2);
            $table->decimal('total_freight', 10, 2);
            $table->decimal('advance_payment', 10, 2);
            $table->decimal('commission', 10, 2)->nullable();
            $table->decimal('balance_payment', 10, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('load_details');
    }
}; 