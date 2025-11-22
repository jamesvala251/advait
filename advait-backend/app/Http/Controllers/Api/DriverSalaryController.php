<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DriverSalary;
use App\Models\Driver;
use Illuminate\Support\Facades\Log;

class DriverSalaryController extends Controller
{
    /**
     * Display a listing of the driver salaries.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $driverSalaries = DriverSalary::with('driver')
                ->orderBy('date', 'desc')
                ->get();

            Log::info('Retrieved driver salaries:', ['count' => $driverSalaries->count()]);
            return response()->json($driverSalaries);
        } catch (\Exception $e) {
            Log::error('Error retrieving driver salaries: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving driver salaries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created driver salary in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'driver_id' => 'required|exists:drivers,id',
                'date' => 'required|date',
                'advanced_salary' => 'required|numeric|min:0',
                'remarks' => 'nullable|string|max:1000'
            ]);

            $driverSalary = DriverSalary::create($validated);
            $driverSalary->load('driver');
            
            Log::info('Driver salary created:', ['driver_salary' => $driverSalary->toArray()]);

            return response()->json($driverSalary, 201);
        } catch (\Exception $e) {
            Log::error('Error creating driver salary: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating driver salary',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified driver salary.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $driverSalary = DriverSalary::with('driver')->findOrFail($id);
            return response()->json($driverSalary);
        } catch (\Exception $e) {
            Log::error('Error retrieving driver salary: ' . $e->getMessage());
            return response()->json([
                'message' => 'Driver salary not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified driver salary in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $driverSalary = DriverSalary::findOrFail($id);

            $validated = $request->validate([
                'driver_id' => 'sometimes|required|exists:drivers,id',
                'date' => 'sometimes|required|date',
                'advanced_salary' => 'sometimes|required|numeric|min:0',
                'remarks' => 'nullable|string|max:1000'
            ]);

            $driverSalary->update($validated);
            $driverSalary->load('driver');
            
            Log::info('Driver salary updated:', ['driver_salary' => $driverSalary->toArray()]);

            return response()->json($driverSalary);
        } catch (\Exception $e) {
            Log::error('Error updating driver salary: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating driver salary',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Remove the specified driver salary from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $driverSalary = DriverSalary::findOrFail($id);
            $driverSalary->delete();
            
            Log::info('Driver salary deleted:', ['id' => $id]);

            return response()->json(['message' => 'Driver salary deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting driver salary: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting driver salary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
