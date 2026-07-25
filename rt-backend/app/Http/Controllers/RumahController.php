<?php

namespace App\Http\Controllers;

use App\Models\Rumah;
use Illuminate\Http\Request;

class RumahController extends Controller
{
    public function index()
    {
        return response()->json(Rumah::with('penghuni')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_rumah' => 'required|string|unique:rumah,nomor_rumah',
            'status_dihuni' => 'required|in:Dihuni,Tidak Dihuni',
            'penghuni_ids' => 'nullable|array',
            'penghuni_ids.*' => 'exists:penghuni,id'
        ]);

        $rumah = Rumah::create([
            'nomor_rumah' => $validated['nomor_rumah'],
            'status_dihuni' => count($request->penghuni_ids ?? []) > 0 ? 'Dihuni' : $validated['status_dihuni']
        ]);

        if (!empty($validated['penghuni_ids'])) {
            foreach ($validated['penghuni_ids'] as $p_id) {
                $rumah->penghuni()->attach($p_id, [
                    'tanggal_mulai' => now()->toDateString()
                ]);
            }
        }

        return response()->json($rumah->load('penghuni'), 201);
    }

    public function show($id)
    {
        return response()->json(Rumah::with('penghuni')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $rumah = Rumah::findOrFail($id);
        
        $validated = $request->validate([
            'nomor_rumah' => 'sometimes|string|unique:rumah,nomor_rumah,'.$id,
            'status_dihuni' => 'sometimes|in:Dihuni,Tidak Dihuni',
            'penghuni_ids' => 'nullable|array',
            'penghuni_ids.*' => 'exists:penghuni,id'
        ]);

        $status = $validated['status_dihuni'] ?? $rumah->status_dihuni;
        if ($request->has('penghuni_ids')) {
            $status = count($validated['penghuni_ids']) > 0 ? 'Dihuni' : 'Tidak Dihuni';
        }

        $rumah->update([
            'nomor_rumah' => $validated['nomor_rumah'] ?? $rumah->nomor_rumah,
            'status_dihuni' => $status
        ]);

        if ($request->has('penghuni_ids')) {
            $new_ids = $validated['penghuni_ids'];
            
            // Get current active residents
            $currentActive = $rumah->penghuni()->wherePivotNull('tanggal_selesai')->get();
            $current_ids = $currentActive->pluck('id')->toArray();

            $to_remove = array_diff($current_ids, $new_ids);
            $to_add = array_diff($new_ids, $current_ids);

            // Remove (end date)
            foreach ($to_remove as $p_id) {
                // we have to update existing pivot which has null tanggal_selesai
                $pivot = $currentActive->where('id', $p_id)->first()->pivot;
                $rumah->penghuni()->updateExistingPivot($p_id, ['tanggal_selesai' => now()->toDateString()], false);
                // using false to update all matching records, but we might want to just update where tanggal_selesai is null. 
                // updateExistingPivot updates all matching foreign keys by default if we don't specify the ID.
                \DB::table('penghuni_rumah')
                    ->where('rumah_id', $rumah->id)
                    ->where('penghuni_id', $p_id)
                    ->whereNull('tanggal_selesai')
                    ->update(['tanggal_selesai' => now()->toDateString()]);
            }

            // Add
            foreach ($to_add as $p_id) {
                $rumah->penghuni()->attach($p_id, [
                    'tanggal_mulai' => now()->toDateString()
                ]);
            }
        }

        return response()->json($rumah->load('penghuni'));
    }

    public function history($id)
    {
        $rumah = Rumah::with('penghuni')->findOrFail($id);
        return response()->json($rumah->penghuni);
    }

    public function destroy($id)
    {
        $rumah = Rumah::findOrFail($id);
        
        if (\App\Models\Tagihan::where('rumah_id', $id)->exists()) {
            return response()->json(['message' => 'Tidak dapat menghapus rumah yang memiliki riwayat tagihan.'], 400);
        }

        $rumah->penghuni()->detach();
        $rumah->delete();
        return response()->json(['message' => 'Rumah berhasil dihapus']);
    }
}
