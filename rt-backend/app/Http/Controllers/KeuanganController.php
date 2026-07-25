<?php

namespace App\Http\Controllers;

use App\Models\Tagihan;
use App\Models\Pengeluaran;
use App\Models\Rumah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KeuanganController extends Controller
{
    public function getTagihan()
    {
        return response()->json(Tagihan::with(['rumah', 'penghuni'])->get());
    }

    public function storeTagihan(Request $request)
    {
        $validated = $request->validate([
            'rumah_id' => 'required|exists:rumah,id',
            'penghuni_id' => 'required|exists:penghuni,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2000',
            'nominal_kebersihan' => 'required|numeric|min:0',
            'nominal_satpam' => 'required|numeric|min:0',
            'status_kebersihan' => 'required|in:Lunas,Belum Lunas',
            'status_satpam' => 'required|in:Lunas,Belum Lunas',
        ]);

        $exists = Tagihan::where('rumah_id', $validated['rumah_id'])
                ->where('bulan', $validated['bulan'])
                ->where('tahun', $validated['tahun'])
                ->exists();

        if ($exists) {
            return response()->json(['message' => 'Tagihan untuk rumah ini pada bulan dan tahun tersebut sudah ada.'], 400);
        }

        $tagihan = Tagihan::create($validated);
        return response()->json($tagihan, 201);
    }

    public function updateTagihan(Request $request, $id)
    {
        $tagihan = Tagihan::findOrFail($id);
        $validated = $request->validate([
            'nominal_kebersihan' => 'required|numeric|min:0',
            'nominal_satpam' => 'required|numeric|min:0',
        ]);

        $tagihan->update($validated);
        return response()->json($tagihan);
    }

    public function destroyTagihan($id)
    {
        $tagihan = Tagihan::findOrFail($id);
        $tagihan->delete();
        return response()->json(['message' => 'Tagihan berhasil dihapus']);
    }

    public function bayarTagihan(Request $request, $id)
    {
        $tagihan = Tagihan::findOrFail($id);
        $validated = $request->validate([
            'jenis_iuran' => 'required|in:Kebersihan,Satpam,Semua',
            'periode_pembayaran' => 'nullable|in:bulanan,tahunan,campuran',
            'action' => 'nullable|in:bayar,batal' // bayar or batal
        ]);

        $action = $validated['action'] ?? 'bayar';
        $periode = $validated['periode_pembayaran'] ?? 'bulanan';

        if ($action === 'batal') {
            // Cancel current month payment
            if ($validated['jenis_iuran'] === 'Kebersihan' || $validated['jenis_iuran'] === 'Semua') {
                $tagihan->status_kebersihan = 'Belum Lunas';
                $tagihan->tanggal_bayar_kebersihan = null;
            }
            if ($validated['jenis_iuran'] === 'Satpam' || $validated['jenis_iuran'] === 'Semua') {
                $tagihan->status_satpam = 'Belum Lunas';
                $tagihan->tanggal_bayar_satpam = null;
            }
            $tagihan->save();
            return response()->json(['message' => 'Pembayaran dibatalkan']);
        }

        // Action = Bayar
        if ($periode === 'bulanan') {
            if ($validated['jenis_iuran'] === 'Kebersihan' || $validated['jenis_iuran'] === 'Semua') {
                $tagihan->status_kebersihan = 'Lunas';
                $tagihan->tanggal_bayar_kebersihan = now();
            }
            if ($validated['jenis_iuran'] === 'Satpam' || $validated['jenis_iuran'] === 'Semua') {
                $tagihan->status_satpam = 'Lunas';
                $tagihan->tanggal_bayar_satpam = now();
            }
            $tagihan->save();
        } else if ($periode === 'tahunan') {
            $start_tahun = $tagihan->tahun;
            $start_bulan = $tagihan->bulan;
            $rumah_id = $tagihan->rumah_id;
            $penghuni_id = $tagihan->penghuni_id;

            for ($i = 0; $i < 12; $i++) {
                $b = ($start_bulan + $i - 1) % 12 + 1;
                $t = $start_tahun + floor(($start_bulan + $i - 1) / 12);

                $tgh = Tagihan::firstOrCreate(
                    ['rumah_id' => $rumah_id, 'penghuni_id' => $penghuni_id, 'bulan' => $b, 'tahun' => $t],
                    [
                        'nominal_kebersihan' => 15000,
                        'nominal_satpam' => 100000,
                        'status_kebersihan' => 'Belum Lunas',
                        'status_satpam' => 'Belum Lunas'
                    ]
                );

                if ($validated['jenis_iuran'] === 'Kebersihan' || $validated['jenis_iuran'] === 'Semua') {
                    $tgh->status_kebersihan = 'Lunas';
                    $tgh->tanggal_bayar_kebersihan = now();
                }
                if ($validated['jenis_iuran'] === 'Satpam' || $validated['jenis_iuran'] === 'Semua') {
                    $tgh->status_satpam = 'Lunas';
                    $tgh->tanggal_bayar_satpam = now();
                }
                $tgh->save();
            }
        } else if ($periode === 'campuran') {
            $start_tahun = $tagihan->tahun;
            $start_bulan = $tagihan->bulan;
            $rumah_id = $tagihan->rumah_id;
            $penghuni_id = $tagihan->penghuni_id;

            for ($i = 0; $i < 12; $i++) {
                $b = ($start_bulan + $i - 1) % 12 + 1;
                $t = $start_tahun + floor(($start_bulan + $i - 1) / 12);

                $tgh = Tagihan::firstOrCreate(
                    ['rumah_id' => $rumah_id, 'penghuni_id' => $penghuni_id, 'bulan' => $b, 'tahun' => $t],
                    [
                        'nominal_kebersihan' => 15000,
                        'nominal_satpam' => 100000,
                        'status_kebersihan' => 'Belum Lunas',
                        'status_satpam' => 'Belum Lunas'
                    ]
                );

                // Iuran Bulanan (Kebersihan) dibayar 12 bulan (mulai dari bulan ini)
                $tgh->status_kebersihan = 'Lunas';
                $tgh->tanggal_bayar_kebersihan = now();

                // Iuran Satpam dibayar HANYA untuk bulan ini (saat i == 0)
                if ($i === 0) {
                    $tgh->status_satpam = 'Lunas';
                    $tgh->tanggal_bayar_satpam = now();
                }

                $tgh->save();
            }
        }
        
        return response()->json(['message' => 'Berhasil diperbarui']);
    }

    public function getPengeluaran()
    {
        return response()->json(Pengeluaran::all());
    }

    public function storePengeluaran(Request $request)
    {
        $validated = $request->validate([
            'keterangan' => 'required|string',
            'jumlah' => 'required|integer|min:0',
            'tanggal' => 'required|date'
        ]);

        $pengeluaran = Pengeluaran::create($validated);
        return response()->json($pengeluaran, 201);
    }

    public function getSummary(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));

        if ($tahun === 'semua') {
            $pemasukanKebersihan = DB::table('tagihan')
                ->where('status_kebersihan', 'Lunas')
                ->selectRaw('tahun, sum(nominal_kebersihan) as total')
                ->groupBy('tahun')
                ->get()->keyBy('tahun');

            $pemasukanSatpam = DB::table('tagihan')
                ->where('status_satpam', 'Lunas')
                ->selectRaw('tahun, sum(nominal_satpam) as total')
                ->groupBy('tahun')
                ->get()->keyBy('tahun');

            $pengeluaran = DB::table('pengeluaran')
                ->selectRaw('YEAR(tanggal) as tahun, sum(jumlah) as total')
                ->groupBy('tahun')
                ->get()->keyBy('tahun');

            $allYears = array_unique(array_merge(
                $pemasukanKebersihan->keys()->toArray(),
                $pemasukanSatpam->keys()->toArray(),
                $pengeluaran->keys()->toArray()
            ));
            sort($allYears);

            $summary = [];
            $saldo = 0;
            foreach ($allYears as $y) {
                $incomeK = $pemasukanKebersihan->has($y) ? $pemasukanKebersihan[$y]->total : 0;
                $incomeS = $pemasukanSatpam->has($y) ? $pemasukanSatpam[$y]->total : 0;
                $income = $incomeK + $incomeS;
                $expense = $pengeluaran->has($y) ? $pengeluaran[$y]->total : 0;
                
                $saldo += ($income - $expense);

                $summary[] = [
                    'tahun' => $y,
                    'pemasukan' => $income,
                    'pengeluaran' => $expense,
                    'saldo' => $saldo
                ];
            }
        } else {
            // Pemasukan
            $pemasukanKebersihan = DB::table('tagihan')
                ->where('tahun', $tahun)
                ->where('status_kebersihan', 'Lunas')
                ->selectRaw('bulan, sum(nominal_kebersihan) as total')
                ->groupBy('bulan')
                ->get()->keyBy('bulan');

            $pemasukanSatpam = DB::table('tagihan')
                ->where('tahun', $tahun)
                ->where('status_satpam', 'Lunas')
                ->selectRaw('bulan, sum(nominal_satpam) as total')
                ->groupBy('bulan')
                ->get()->keyBy('bulan');

            // Pengeluaran
            $pengeluaran = DB::table('pengeluaran')
                ->whereYear('tanggal', $tahun)
                ->selectRaw('MONTH(tanggal) as bulan, sum(jumlah) as total')
                ->groupBy('bulan')
                ->get()->keyBy('bulan');

            $summary = [];
            $saldo = 0;
            for ($i = 1; $i <= 12; $i++) {
                $incomeK = $pemasukanKebersihan->has($i) ? $pemasukanKebersihan[$i]->total : 0;
                $incomeS = $pemasukanSatpam->has($i) ? $pemasukanSatpam[$i]->total : 0;
                $income = $incomeK + $incomeS;
                $expense = $pengeluaran->has($i) ? $pengeluaran[$i]->total : 0;
                
                $saldo += ($income - $expense);

                $summary[] = [
                    'bulan' => $i,
                    'pemasukan' => $income,
                    'pengeluaran' => $expense,
                    'saldo' => $saldo
                ];
            }
        }

        $totalIncomeK = DB::table('tagihan')->where('status_kebersihan', 'Lunas')->sum('nominal_kebersihan');
        $totalIncomeS = DB::table('tagihan')->where('status_satpam', 'Lunas')->sum('nominal_satpam');
        $totalExpense = DB::table('pengeluaran')->sum('jumlah');

        return response()->json([
            'summary' => $summary,
            'total_saldo' => ($totalIncomeK + $totalIncomeS) - $totalExpense
        ]);
    }

    public function getAvailableYears()
    {
        $yearsTagihan = DB::table('tagihan')->select('tahun')->distinct()->pluck('tahun')->toArray();
        $yearsPengeluaran = DB::table('pengeluaran')->selectRaw('YEAR(tanggal) as tahun')->distinct()->pluck('tahun')->toArray();
        
        $years = array_unique(array_merge($yearsTagihan, $yearsPengeluaran));
        if (empty($years)) {
            $years = [date('Y')];
        }
        sort($years);
        
        // Filter out future years just in case
        $currentYear = (int)date('Y');
        $years = array_filter($years, function($y) use ($currentYear) {
            return $y <= $currentYear;
        });

        return response()->json(array_values($years));
    }
}
