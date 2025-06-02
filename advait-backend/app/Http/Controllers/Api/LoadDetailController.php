<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LoadDetail;
use App\Models\Truck;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LoadDetailController extends Controller
{
    public function index()
    {
        try {
            $loadDetails = LoadDetail::with('truck:id,truck_number')
                ->orderBy('date', 'desc')
                ->get();
            return response()->json(['data' => $loadDetails]);
        } catch (\Exception $e) {
            Log::error('Error fetching load details: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch load details'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'date' => 'required|date',
                'truck_id' => 'required|exists:trucks,id',
                'location' => 'required|string',
                'load_qty' => 'required|numeric|min:0',
                'diesel_amount' => 'required|numeric|min:0',
                'freight' => 'required|numeric|min:0',
                'total_freight' => 'required|numeric|min:0',
                'advance_payment' => 'required|numeric|min:0',
                'commission' => 'nullable|numeric|min:0',
                'balance_payment' => 'required|numeric'
            ]);

            $loadDetail = LoadDetail::create($validated);
            $loadDetail->load('truck:id,truck_number');
            
            return response()->json([
                'message' => 'Load detail created successfully',
                'data' => $loadDetail
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating load detail: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create load detail'], 500);
        }
    }

    public function show($id)
    {
        try {
            $loadDetail = LoadDetail::with('truck:id,truck_number')->findOrFail($id);
            return response()->json(['data' => $loadDetail]);
        } catch (\Exception $e) {
            Log::error('Error fetching load detail: ' . $e->getMessage());
            return response()->json(['error' => 'Load detail not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $loadDetail = LoadDetail::findOrFail($id);
            
            $validated = $request->validate([
                'date' => 'required|date',
                'truck_id' => 'required|exists:trucks,id',
                'location' => 'required|string',
                'load_qty' => 'required|numeric|min:0',
                'diesel_amount' => 'required|numeric|min:0',
                'freight' => 'required|numeric|min:0',
                'total_freight' => 'required|numeric|min:0',
                'advance_payment' => 'required|numeric|min:0',
                'commission' => 'nullable|numeric|min:0',
                'balance_payment' => 'required|numeric'
            ]);

            $loadDetail->update($validated);
            $loadDetail->load('truck:id,truck_number');
            
            return response()->json([
                'message' => 'Load detail updated successfully',
                'data' => $loadDetail
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating load detail: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update load detail'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $loadDetail = LoadDetail::findOrFail($id);
            $loadDetail->delete();
            return response()->json(['message' => 'Load detail deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting load detail: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete load detail'], 500);
        }
    }
} 