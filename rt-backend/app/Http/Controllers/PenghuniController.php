<?php

namespace App\Http\Controllers;

use App\Models\Penghuni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PenghuniController extends Controller
{
    public function index()
    {
        return response()->json(Penghuni::with('rumah')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string',
            'status_penghuni' => 'required|in:Kontrak,Tetap',
            'nomor_telepon' => 'required|string',
            'status_pernikahan' => 'required|in:Menikah,Belum Menikah',
            'foto_ktp' => 'nullable|image|max:2048',
            'rumah_id' => 'nullable|exists:rumah,id'
        ]);

        if ($request->hasFile('foto_ktp')) {
            $path = $request->file('foto_ktp')->store('public/ktp');
            $validated['foto_ktp'] = str_replace('public/', 'storage/', $path);
        }

        $penghuni = Penghuni::create($validated);
        
        if (!empty($validated['rumah_id'])) {
            $penghuni->rumah()->attach($validated['rumah_id'], [
                'tanggal_mulai' => now()->toDateString()
            ]);
            \App\Models\Rumah::where('id', $validated['rumah_id'])->update(['status_dihuni' => 'Dihuni']);
        }

        return response()->json($penghuni->load('rumah'), 201);
    }

    public function show($id)
    {
        return response()->json(Penghuni::with('rumah')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $penghuni = Penghuni::findOrFail($id);
        
        $validated = $request->validate([
            'nama_lengkap' => 'sometimes|string',
            'status_penghuni' => 'sometimes|in:Kontrak,Tetap',
            'nomor_telepon' => 'sometimes|string',
            'status_pernikahan' => 'sometimes|in:Menikah,Belum Menikah',
            'foto_ktp' => 'nullable|image|max:2048',
            'rumah_id' => 'nullable|exists:rumah,id'
        ]);

        if ($request->hasFile('foto_ktp')) {
            if ($penghuni->foto_ktp) {
                Storage::delete(str_replace('storage/', 'public/', $penghuni->foto_ktp));
            }
            $path = $request->file('foto_ktp')->store('public/ktp');
            $validated['foto_ktp'] = str_replace('public/', 'storage/', $path);
        }

        $penghuni->update($validated);

        if ($request->has('rumah_id')) {
            $rumah_id = $request->rumah_id;
            $currentRumah = $penghuni->rumah()->wherePivotNull('tanggal_selesai')->first();
            
            if ($rumah_id == '') {
                // Remove from house
                if ($currentRumah) {
                    $penghuni->rumah()->updateExistingPivot($currentRumah->id, ['tanggal_selesai' => now()->toDateString()]);
                    \App\Models\Rumah::where('id', $currentRumah->id)->update(['status_dihuni' => 'Tidak Dihuni']);
                }
            } else if (!$currentRumah || $currentRumah->id != $rumah_id) {
                // End previous
                if ($currentRumah) {
                    $penghuni->rumah()->updateExistingPivot($currentRumah->id, ['tanggal_selesai' => now()->toDateString()]);
                    \App\Models\Rumah::where('id', $currentRumah->id)->update(['status_dihuni' => 'Tidak Dihuni']);
                }
                // Assign new
                $penghuni->rumah()->attach($rumah_id, ['tanggal_mulai' => now()->toDateString()]);
                \App\Models\Rumah::where('id', $rumah_id)->update(['status_dihuni' => 'Dihuni']);
            }
        }

        return response()->json($penghuni->load('rumah'));
    }

    public function destroy($id)
    {
        $penghuni = Penghuni::findOrFail($id);
        
        if (\App\Models\Tagihan::where('penghuni_id', $id)->exists()) {
            return response()->json(['message' => 'Tidak dapat menghapus penghuni yang memiliki riwayat tagihan.'], 400);
        }

        if ($penghuni->foto_ktp) {
            Storage::delete(str_replace('storage/', 'public/', $penghuni->foto_ktp));
        }
        $penghuni->rumah()->detach();
        $penghuni->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
