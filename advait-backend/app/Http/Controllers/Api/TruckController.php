<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Truck;
use Illuminate\Support\Facades\Log;

class TruckController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $trucks = Truck::all();
        return response()->json($trucks);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Log the raw request data
        Log::info('Raw request data:', $request->all());

        $validated = $request->validate([
            'truck_number' => 'required|string|unique:trucks',
            'model' => 'required|string',
            'capacity' => 'required|integer',
            'status' => 'required|string'
        ]);

        // Log the validated data
        Log::info('Validated data:', $validated);

        try {
            $truck = Truck::create($validated);
            Log::info('Created truck:', $truck->toArray());
            return response()->json($truck, 201);
        } catch (\Exception $e) {
            Log::error('Error creating truck: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating truck',
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
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $truck = Truck::findOrFail($id);
        $truck->delete();
        return response()->json(['message' => 'Truck deleted successfully']);
    }
}
