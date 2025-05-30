<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TruckExpense;
use App\Models\Truck;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TruckExpenseController extends Controller
{
    /**
     * Display a listing of truck expenses.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $query = TruckExpense::select([
                'truck_expenses.id',
                'trucks.truck_number',
                'truck_expenses.expense_type',
                'truck_expenses.date',
                'truck_expenses.amount',
                'truck_expenses.details',
                'truck_expenses.truck_id'
            ])
            ->join('trucks', 'truck_expenses.truck_id', '=', 'trucks.id')
            ->orderBy('truck_expenses.date', 'desc');

            // Apply filters if provided
            if ($request->has('truck_id')) {
                $query->where('trucks.id', $request->truck_id);
            }

            if ($request->has('expense_type')) {
                $query->where('truck_expenses.expense_type', $request->expense_type);
            }

            if ($request->has('start_date')) {
                $query->where('truck_expenses.date', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('truck_expenses.date', '<=', $request->end_date);
            }

            $expenses = $query->get();

            // Calculate totals
            $totals = [
                'total_amount' => $expenses->sum('amount'),
                'maintenance_total' => $expenses->where('expense_type', 'maintenance')->sum('amount'),
                'tyre_total' => $expenses->where('expense_type', 'tyre')->sum('amount')
            ];

            Log::info('Truck expenses retrieved:', [
                'count' => $expenses->count(),
                'totals' => $totals
            ]);

            return response()->json([
                'expenses' => $expenses,
                'totals' => $totals
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving truck expenses: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving truck expenses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created truck expense.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'truck_id' => 'required|exists:trucks,id',
                'expense_type' => 'required|in:maintenance,tyre',
                'date' => 'required|date',
                'amount' => 'required|numeric|min:0',
                'details' => 'required|string'
            ]);

            $expense = TruckExpense::create($validated);

            Log::info('Truck expense created:', ['expense' => $expense->toArray()]);

            return response()->json($expense, 201);

        } catch (\Exception $e) {
            Log::error('Error creating truck expense: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating truck expense',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified truck expense.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $expense = TruckExpense::with('truck')->findOrFail($id);
            return response()->json($expense);
        } catch (\Exception $e) {
            Log::error('Error retrieving truck expense: ' . $e->getMessage());
            return response()->json([
                'message' => 'Truck expense not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get expense details for editing
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        try {
            $expense = TruckExpense::with('truck:id,truck_number')
                ->findOrFail($id);

            // Get all active trucks for the dropdown
            $trucks = Truck::select('id', 'truck_number')
                ->where('status', 'active')
                ->orderBy('truck_number')
                ->get();

            Log::info('Retrieved expense for editing:', ['expense_id' => $id]);

            return response()->json([
                'expense' => $expense,
                'trucks' => $trucks
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving expense for editing: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving expense details',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified truck expense.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $expense = TruckExpense::findOrFail($id);

            $validated = $request->validate([
                'truck_id' => 'sometimes|required|exists:trucks,id',
                'expense_type' => 'sometimes|required|in:maintenance,tyre',
                'date' => 'sometimes|required|date',
                'amount' => 'sometimes|required|numeric|min:0',
                'details' => 'sometimes|required|string'
            ]);

            // Log the update request
            Log::info('Updating truck expense:', [
                'expense_id' => $id,
                'old_data' => $expense->toArray(),
                'new_data' => $validated
            ]);

            $expense->update($validated);

            // Load the truck relationship for the response
            $expense->load('truck:id,truck_number');

            Log::info('Truck expense updated successfully:', ['expense' => $expense->toArray()]);

            return response()->json([
                'message' => 'Truck expense updated successfully',
                'expense' => $expense
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating truck expense: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating truck expense',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Remove the specified truck expense.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $expense = TruckExpense::findOrFail($id);
            $expense->delete();

            Log::info('Truck expense deleted:', ['id' => $id]);

            return response()->json(['message' => 'Truck expense deleted successfully']);

        } catch (\Exception $e) {
            Log::error('Error deleting truck expense: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting truck expense',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Get list of trucks for dropdown
     *
     * @return \Illuminate\Http\Response
     */
    public function getTrucks()
    {
        try {
            $trucks = Truck::select('id', 'truck_number')
                ->where('status', 'active')
                ->orderBy('truck_number')
                ->get();

            return response()->json($trucks);
        } catch (\Exception $e) {
            Log::error('Error retrieving trucks: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error retrieving trucks',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 