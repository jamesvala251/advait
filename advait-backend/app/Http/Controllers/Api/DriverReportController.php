<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DriverReportController extends Controller
{
    /**
     * Get driver reports with trip details
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $query = Trip::select([
                'drivers.name as driver_name',
                'trips.start_date',
                'trips.end_date',
                'trips.origin',
                'trips.destination',
                'trips.driver_salary',
                'trips.advanced_salary',
                DB::raw('trips.driver_salary - trips.advanced_salary as balanced_salary')
            ])
            ->join('drivers', 'trips.driver_id', '=', 'drivers.id')
            ->orderBy('trips.start_date', 'desc');

            // Apply filters if provided
            if ($request->has('driver_id')) {
                $query->where('drivers.id', $request->driver_id);
            } elseif ($request->has('driver_name')) {
                $query->where('drivers.name', $request->driver_name);
            }

            if ($request->has('start_date')) {
                $query->where('trips.start_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('trips.end_date', '<=', $request->end_date);
            }

            $reports = $query->get();

            // Calculate totals
            $totals = [
                'total_salary' => $reports->sum('driver_salary'),
                'total_advanced' => $reports->sum('advanced_salary'),
                'total_balanced' => $reports->sum('balanced_salary')
            ];

            Log::info('Driver reports retrieved:', [
                'count' => $reports->count(),
                'totals' => $totals
            ]);

            return response()->json([
                'reports' => $reports,
                'totals' => $totals
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving driver reports: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving driver reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 