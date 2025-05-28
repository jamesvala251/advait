<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TripProfitLossController extends Controller
{
    /**
     * Get trip profit/loss reports
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $query = Trip::select([
                'trips.trip_number',
                'drivers.name as driver_name',
                'trucks.truck_number as truck',
                DB::raw("CONCAT(trips.start_date, ' to ', trips.end_date) as dates"),
                DB::raw("CONCAT(trips.origin, ' to ', trips.destination) as route"),
                'trips.total_km',
                'trips.total_expenses',
                'trips.total_profit',
                'trips.per_day_profit'
            ])
            ->join('drivers', 'trips.driver_id', '=', 'drivers.id')
            ->join('trucks', 'trips.truck_id', '=', 'trucks.id')
            ->orderBy('trips.start_date', 'desc');

            // Apply filters if provided
            if ($request->has('start_date')) {
                $query->where('trips.start_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('trips.end_date', '<=', $request->end_date);
            }

            if ($request->has('driver_id')) {
                $query->where('drivers.id', $request->driver_id);
            }

            if ($request->has('truck_id')) {
                $query->where('trucks.id', $request->truck_id);
            }

            $reports = $query->get();

            // Calculate totals
            $totals = [
                'total_km' => $reports->sum('total_km'),
                'total_expenses' => $reports->sum('total_expenses'),
                'total_profit' => $reports->sum('total_profit'),
                'total_per_day_profit' => $reports->sum('per_day_profit')
            ];

            Log::info('Trip profit/loss reports retrieved:', [
                'count' => $reports->count(),
                'totals' => $totals
            ]);

            return response()->json([
                'reports' => $reports,
                'totals' => $totals
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving trip profit/loss reports: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving trip profit/loss reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 