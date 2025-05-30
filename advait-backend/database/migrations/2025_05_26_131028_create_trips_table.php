<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('truck_id');
            $table->unsignedBigInteger('driver_id');
            $table->string('origin');
            $table->string('destination');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('distance', 10, 2);
            $table->decimal('fuel_consumed', 10, 2);
            $table->string('status')->default('pending');
            $table->integer('trip_number');
            $table->string('party_name');
            $table->string('compressor')->default('No');
            $table->decimal('start_km', 10, 2);
            $table->decimal('end_km', 10, 2);
            $table->decimal('diesel_amount', 10, 2);
            $table->decimal('toll', 10, 2);
            $table->decimal('driver_salary', 10, 2);
            $table->decimal('advanced_salary', 10, 2);
            $table->decimal('maintenance', 10, 2)->default(0);
            $table->decimal('freight', 10, 2);
            $table->decimal('weight', 10, 2);
            $table->decimal('total_freight', 10, 2);
            $table->decimal('total_km', 10, 2);
            $table->decimal('total_expenses', 10, 2);
            $table->decimal('total_profit', 10, 2);
            $table->decimal('per_day_profit', 10, 2);
            $table->timestamps();

            $table->foreign('truck_id')->references('id')->on('trucks');
            $table->foreign('driver_id')->references('id')->on('drivers');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('trips');
    }
};
