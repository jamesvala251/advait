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
        $trucks = Truck::with('trips')->get();
        return response()->json(['data' => $trucks]);
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
        $truck = Truck::with('trips')->findOrFail($id);
        return response()->json($truck);
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
        $truck = Truck::findOrFail($id);

        $validated = $request->validate([
            'truck_number' => 'required|string|unique:trucks,truck_number,' . $id,
            'model' => 'required|string',
            'capacity' => 'required|integer',
            'status' => 'required|string'
        ]);

        try {
            $truck->update($validated);
            return response()->json($truck);
        } catch (\Exception $e) {
            Log::error('Error updating truck: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating truck',
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
            $truck = Truck::findOrFail($id);
            
            // Check if truck has any active trips
            $hasActiveTrips = $truck->trips()->where('status', 'active')->exists();
            
            if ($hasActiveTrips) {
                return response()->json([
                    'message' => 'Cannot delete truck with active trips',
                    'error' => 'Truck has active trips associated with it'
                ], 422);
            }

            $truck->delete();
            return response()->json(['message' => 'Truck deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting truck: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete truck',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restore a soft-deleted truck.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function restore($id)
    {
        try {
            $truck = Truck::withTrashed()->findOrFail($id);
            $truck->restore();
            return response()->json(['message' => 'Truck restored successfully']);
        } catch (\Exception $e) {
            Log::error('Error restoring truck: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to restore truck',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
