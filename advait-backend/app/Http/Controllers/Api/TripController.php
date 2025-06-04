<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trip;
use App\Models\Truck;
use App\Models\Driver;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TripController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $trips = Trip::select([
                'id',
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
            ])->with([
                'truck:id,truck_number,model,capacity,status',
                'driver:id,name,license_number,phone,status'
            ])->get();
            
            Log::info('Retrieved trips:', ['count' => $trips->count(), 'trips' => $trips->toArray()]);
            return response()->json(['data' => $trips]);
        } catch (\Exception $e) {
            Log::error('Error retrieving trips: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving trips',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        Log::info('Raw trip request data:', $request->all());

        // Validate the request data
        $validator = Validator::make($request->all(), [
            'truckNumber' => 'required|string',
            'startDate' => 'required|date',
            'endDate' => 'required|date',
            'from' => 'required|string',
            'to' => 'required|string',
            'partyName' => 'required|string',
            'compressor' => 'required|string',
            'startKm' => 'required|numeric',
            'endKm' => 'required|numeric',
            'dieselQty' => 'required|numeric',
            'dieselAmount' => 'required|numeric',
            'toll' => 'required|numeric',
            'driverSalary' => 'required|numeric',
            'advancedSalary' => 'required|numeric',
            'driverName' => 'required|string',
            'maintenance' => 'required|numeric',
            'freight' => 'required|numeric',
            'weight' => 'required|numeric',
            'totalFreight' => 'required|numeric',
            'totalKm' => 'required|numeric',
            'totalExpenses' => 'required|numeric',
            'totalProfit' => 'required|numeric',
            'perDayProfit' => 'required|numeric'
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', [
                'errors' => $validator->errors()->toArray(),
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get the next trip number using a raw SQL query with a lock
            $nextTripNumber = DB::select("SELECT COALESCE(MAX(trip_number), 0) + 1 as next_number FROM trips FOR UPDATE")[0]->next_number;
            
            Log::info('Generated next trip number:', ['next_trip_number' => $nextTripNumber]);

            // First, find or create the truck
            $truck = Truck::firstOrCreate(
                ['truck_number' => $request->truckNumber],
                [
                    'model' => 'Default',
                    'capacity' => 0,
                    'status' => 'active'
                ]
            );

            Log::info('Truck found/created:', ['truck' => $truck->toArray()]);

            // Find or create the driver
            $licenseNumber = 'TEMP-' . time();
            $driver = Driver::firstOrCreate(
                ['license_number' => $licenseNumber],
                [
                    'name' => $request->driverName,
                    'phone' => 'N/A',
                    'status' => 'active'
                ]
            );

            Log::info('Driver found/created:', ['driver' => $driver->toArray()]);

            // Calculate distance
            $distance = floatval($request->endKm) - floatval($request->startKm);

            // Create the trip
            $tripData = [
                'truck_id' => $truck->id,
                'driver_id' => $driver->id,
                'origin' => $request->from,
                'destination' => $request->to,
                'start_date' => $request->startDate,
                'end_date' => $request->endDate,
                'distance' => $distance,
                'fuel_consumed' => floatval($request->dieselQty),
                'status' => 'completed',
                'trip_number' => $nextTripNumber,
                'party_name' => $request->partyName,
                'compressor' => $request->compressor,
                'start_km' => floatval($request->startKm),
                'end_km' => floatval($request->endKm),
                'diesel_amount' => floatval($request->dieselAmount),
                'toll' => floatval($request->toll),
                'driver_salary' => floatval($request->driverSalary),
                'advanced_salary' => floatval($request->advancedSalary),
                'maintenance' => floatval($request->maintenance),
                'freight' => floatval($request->freight),
                'weight' => floatval($request->weight),
                'total_freight' => floatval($request->totalFreight),
                'total_km' => floatval($request->totalKm),
                'total_expenses' => floatval($request->totalExpenses),
                'total_profit' => floatval($request->totalProfit),
                'per_day_profit' => floatval($request->perDayProfit)
            ];

            Log::info('Creating trip with data:', $tripData);

            try {
                $trip = Trip::create($tripData);
                Log::info('Trip created successfully:', ['trip' => $trip->toArray()]);
            } catch (\Exception $e) {
                Log::error('Error creating trip record:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'data' => $tripData
                ]);
                throw $e;
            }

            DB::commit();
            return response()->json($trip->load(['truck', 'driver']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in trip creation process:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Error creating trip',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $trip = Trip::with(['truck', 'driver', 'expenses'])->findOrFail($id);
        return response()->json($trip);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        Log::info('Raw trip update data:', $request->all());

        try {
            DB::beginTransaction();

            $trip = Trip::findOrFail($id);

            // Update truck if truck number changed
            if ($request->has('truckNumber')) {
                $truck = Truck::firstOrCreate(
                    ['truck_number' => $request->truckNumber],
                    [
                        'model' => 'Default',
                        'capacity' => 0,
                        'status' => 'active'
                    ]
                );
                $trip->truck_id = $truck->id;
            }

            // Update driver if driver name changed
            if ($request->has('driverName')) {
                $licenseNumber = 'TEMP-' . time();
                $driver = Driver::firstOrCreate(
                    ['license_number' => $licenseNumber],
                    [
                        'name' => $request->driverName,
                        'phone' => 'N/A',
                        'status' => 'active'
                    ]
                );
                $trip->driver_id = $driver->id;
            }

            // Update other fields
            $trip->update([
                'origin' => $request->from ?? $trip->origin,
                'destination' => $request->to ?? $trip->destination,
                'start_date' => $request->startDate ?? $trip->start_date,
                'end_date' => $request->endDate ?? $trip->end_date,
                'distance' => $request->has('endKm') && $request->has('startKm') 
                    ? floatval($request->endKm) - floatval($request->startKm) 
                    : $trip->distance,
                'fuel_consumed' => $request->dieselQty ? floatval($request->dieselQty) : $trip->fuel_consumed,
                'trip_number' => $request->tripNumber ?? $trip->trip_number,
                'party_name' => $request->partyName ?? $trip->party_name,
                'compressor' => $request->compressor ?? $trip->compressor,
                'start_km' => $request->startKm ? floatval($request->startKm) : $trip->start_km,
                'end_km' => $request->endKm ? floatval($request->endKm) : $trip->end_km,
                'diesel_amount' => $request->dieselAmount ? floatval($request->dieselAmount) : $trip->diesel_amount,
                'toll' => $request->toll ? floatval($request->toll) : $trip->toll,
                'driver_salary' => $request->driverSalary ? floatval($request->driverSalary) : $trip->driver_salary,
                'advanced_salary' => $request->advancedSalary ? floatval($request->advancedSalary) : $trip->advanced_salary,
                'maintenance' => $request->maintenance ? floatval($request->maintenance) : $trip->maintenance,
                'freight' => $request->freight ? floatval($request->freight) : $trip->freight,
                'weight' => $request->weight ? floatval($request->weight) : $trip->weight,
                'total_freight' => $request->totalFreight ? floatval($request->totalFreight) : $trip->total_freight,
                'total_km' => $request->totalKm ? floatval($request->totalKm) : $trip->total_km,
                'total_expenses' => $request->totalExpenses ? floatval($request->totalExpenses) : $trip->total_expenses,
                'total_profit' => $request->totalProfit ? floatval($request->totalProfit) : $trip->total_profit,
                'per_day_profit' => $request->perDayProfit ? floatval($request->perDayProfit) : $trip->per_day_profit
            ]);

            DB::commit();
            Log::info('Updated trip:', $trip->toArray());
            return response()->json($trip->load(['truck', 'driver']), 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating trip: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating trip',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $trip = Trip::findOrFail($id);
            $trip->delete();
            return response()->json(['message' => 'Trip deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting trip: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting trip',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
