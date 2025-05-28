<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use Illuminate\Support\Facades\Log;

class DriverController extends Controller
{
    /**
     * Display a listing of the drivers.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $drivers = Driver::select([
                'id',
                'name',
                'license_number',
                'phone',
                'status'
            ])->get();

            Log::info('Retrieved drivers:', ['count' => $drivers->count()]);
            return response()->json($drivers);
        } catch (\Exception $e) {
            Log::error('Error retrieving drivers: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving drivers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created driver in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'license_number' => 'required|string|unique:drivers',
                'phone' => 'required|string|max:20',
                'status' => 'required|in:active,inactive'
            ]);

            $driver = Driver::create($validated);
            Log::info('Driver created:', ['driver' => $driver->toArray()]);

            return response()->json($driver, 201);
        } catch (\Exception $e) {
            Log::error('Error creating driver: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating driver',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified driver.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $driver = Driver::findOrFail($id);
            return response()->json($driver);
        } catch (\Exception $e) {
            Log::error('Error retrieving driver: ' . $e->getMessage());
            return response()->json([
                'message' => 'Driver not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified driver in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $driver = Driver::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'license_number' => 'sometimes|required|string|unique:drivers,license_number,' . $id,
                'phone' => 'sometimes|required|string|max:20',
                'status' => 'sometimes|required|in:active,inactive'
            ]);

            $driver->update($validated);
            Log::info('Driver updated:', ['driver' => $driver->toArray()]);

            return response()->json($driver);
        } catch (\Exception $e) {
            Log::error('Error updating driver: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating driver',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Remove the specified driver from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $driver = Driver::findOrFail($id);
            $driver->delete();
            Log::info('Driver deleted:', ['id' => $id]);
            return response()->json(['message' => 'Driver deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting driver: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting driver',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
