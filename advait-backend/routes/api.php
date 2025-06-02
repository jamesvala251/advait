<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TruckController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DriverReportController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\TripProfitLossController;
use App\Http\Controllers\Api\TruckExpenseController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Trucks
Route::get('/trucks', [TruckController::class, 'index']);
Route::post('/trucks', [TruckController::class, 'store']);
Route::put('/trucks/{id}', [TruckController::class, 'update']);
Route::delete('/trucks/{id}', [TruckController::class, 'destroy']);
Route::post('/trucks/{id}/restore', [TruckController::class, 'restore']);

// Trips
Route::get('/trips', [TripController::class, 'index']);
Route::post('/trips', [TripController::class, 'store']);
Route::put('/trips/{id}', [TripController::class, 'update']);
Route::delete('/trips/{id}', [TripController::class, 'destroy']);

// Expenses
Route::get('/expenses', [ExpenseController::class, 'index']);
Route::post('/expenses', [ExpenseController::class, 'store']);
Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

// Drivers
Route::get('/drivers', [DriverController::class, 'index']);
Route::post('/drivers', [DriverController::class, 'store']);
Route::get('/drivers/{id}', [DriverController::class, 'show']);
Route::put('/drivers/{id}', [DriverController::class, 'update']);
Route::delete('/drivers/{id}', [DriverController::class, 'destroy']);

// Truck Expenses
Route::get('/truck-expenses', [TruckExpenseController::class, 'index']);
Route::post('/truck-expenses', [TruckExpenseController::class, 'store']);
Route::get('/truck-expenses/{id}/edit', [TruckExpenseController::class, 'edit']);
Route::get('/truck-expenses/{id}', [TruckExpenseController::class, 'show']);
Route::put('/truck-expenses/{id}', [TruckExpenseController::class, 'update']);
Route::delete('/truck-expenses/{id}', [TruckExpenseController::class, 'destroy']);
Route::get('/truck-expenses/trucks', [TruckExpenseController::class, 'getTrucks']);

// Reports
Route::get('/reports/profit-loss', [ReportController::class, 'profitLoss']);
Route::get('/reports/driver', [ReportController::class, 'driver']);
Route::get('/reports/truck', [ReportController::class, 'truck']);
Route::get('/reports/driver-details', [DriverReportController::class, 'index']);
Route::get('/reports/trip-profit-loss', [TripProfitLossController::class, 'index']);