<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trip;
use App\Models\Truck;
use App\Models\Driver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    public function profitLoss(Request $request)
    {
        try {
            $query = Trip::select([
                DB::raw('SUM(total_profit) as total_profit'),
                DB::raw('SUM(total_expenses) as total_expenses'),
                DB::raw('SUM(total_km) as total_km')
            ]);

            if ($request->has('start_date')) {
                $query->where('start_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('end_date', '<=', $request->end_date);
            }

            $report = $query->first();

            return response()->json($report);
        } catch (\Exception $e) {
            Log::error('Error generating profit/loss report: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error generating report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function driver(Request $request)
    {
        try {
            $query = Driver::select([
                'drivers.*',
                DB::raw('COUNT(trips.id) as total_trips'),
                DB::raw('SUM(trips.total_km) as total_km'),
                DB::raw('SUM(trips.driver_salary) as total_salary')
            ])
            ->leftJoin('trips', 'drivers.id', '=', 'trips.driver_id')
            ->groupBy('drivers.id');

            if ($request->has('start_date')) {
                $query->where('trips.start_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('trips.end_date', '<=', $request->end_date);
            }

            $report = $query->get();

            return response()->json($report);
        } catch (\Exception $e) {
            Log::error('Error generating driver report: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error generating report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function truck(Request $request)
    {
        try {
            $query = Truck::select([
                'trucks.*',
                DB::raw('COUNT(trips.id) as total_trips'),
                DB::raw('SUM(trips.total_km) as total_km'),
                DB::raw('SUM(trips.total_profit) as total_profit')
            ])
            ->leftJoin('trips', 'trucks.id', '=', 'trips.truck_id')
            ->groupBy('trucks.id');

            if ($request->has('start_date')) {
                $query->where('trips.start_date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('trips.end_date', '<=', $request->end_date);
            }

            $report = $query->get();

            return response()->json($report);
        } catch (\Exception $e) {
            Log::error('Error generating truck report: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error generating report',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 