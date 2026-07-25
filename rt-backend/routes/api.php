<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PenghuniController;
use App\Http\Controllers\RumahController;
use App\Http\Controllers\KeuanganController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Penghuni
Route::apiResource('penghuni', PenghuniController::class);

// Rumah
Route::apiResource('rumah', RumahController::class);
Route::get('rumah/{id}/history', [RumahController::class, 'history']);

// Keuangan
Route::get('tagihan', [KeuanganController::class, 'getTagihan']);
Route::post('tagihan', [KeuanganController::class, 'storeTagihan']);
Route::put('tagihan/{id}', [KeuanganController::class, 'updateTagihan']);
Route::delete('tagihan/{id}', [KeuanganController::class, 'destroyTagihan']);
Route::post('tagihan/{id}/bayar', [KeuanganController::class, 'bayarTagihan']);

Route::get('pengeluaran', [KeuanganController::class, 'getPengeluaran']);
Route::post('pengeluaran', [KeuanganController::class, 'storePengeluaran']);

Route::get('summary', [KeuanganController::class, 'getSummary']);
Route::get('summary/years', [KeuanganController::class, 'getAvailableYears']);
