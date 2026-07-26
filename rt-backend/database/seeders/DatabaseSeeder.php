<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Penghuni;
use App\Models\Rumah;
use App\Models\Tagihan;
use App\Models\Pengeluaran;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Setup Admin
        User::factory()->create([
            'name' => 'Admin RT',
            'email' => 'admin@rt.local',
        ]);

        $faker = \Faker\Factory::create('id_ID');
        $now = Carbon::now();
        $currentYear = $now->year;
        $currentMonth = $now->month;

        // 2. Setup 20 Rumah (A01 - A20)
        $rumahList = [];
        for ($i = 1; $i <= 20; $i++) {
            $nomor = 'A' . str_pad($i, 2, '0', STR_PAD_LEFT);
            // Default Tidak Dihuni, nanti kita update jika ada penghuni aktif
            $rumahList[] = Rumah::create([
                'nomor_rumah' => $nomor,
                'status_dihuni' => 'Tidak Dihuni'
            ]);
        }

        // 3. Setup Penghuni Tetap (15 orang) untuk Rumah 1-15 (A01-A15)
        for ($i = 0; $i < 15; $i++) {
            $penghuni = Penghuni::create([
                'nama_lengkap' => $faker->name,
                'status_penghuni' => 'Tetap',
                'nomor_telepon' => $faker->phoneNumber,
                'status_pernikahan' => $faker->randomElement(['Menikah', 'Belum Menikah']),
                'foto_ktp' => null
            ]);

            // Assign ke rumah mulai Januari tahun ini
            $rumahList[$i]->penghuni()->attach($penghuni->id, [
                'tanggal_mulai' => Carbon::createFromDate($currentYear, 1, 1)->toDateString()
            ]);
            $rumahList[$i]->update(['status_dihuni' => 'Dihuni']);

            // Generate Tagihan dari Januari sampai Bulan Ini
            for ($m = 1; $m <= $currentMonth; $m++) {
                $isPaid = ($m == $currentMonth) ? $faker->boolean(50) : true;
                Tagihan::create([
                    'rumah_id' => $rumahList[$i]->id,
                    'penghuni_id' => $penghuni->id,
                    'bulan' => $m,
                    'tahun' => $currentYear,
                    'nominal_kebersihan' => 15000,
                    'nominal_satpam' => 100000,
                    'status_kebersihan' => $isPaid ? 'Lunas' : 'Belum Lunas',
                    'status_satpam' => $isPaid ? 'Lunas' : 'Belum Lunas',
                ]);
            }
        }

        // 4. Setup Penghuni Kontrak/Sementara untuk Rumah 16-20
        
        // A16: Pernah dihuni Jan - Mar (Sekarang Kosong)
        if ($currentMonth >= 3) {
            $p16 = Penghuni::create([
                'nama_lengkap' => $faker->name,
                'status_penghuni' => 'Kontrak',
                'nomor_telepon' => $faker->phoneNumber,
                'status_pernikahan' => 'Belum Menikah'
            ]);
            $rumahList[15]->penghuni()->attach($p16->id, [
                'tanggal_mulai' => Carbon::createFromDate($currentYear, 1, 1)->toDateString(),
                'tanggal_selesai' => Carbon::createFromDate($currentYear, 3, 31)->toDateString()
            ]);
            // Tagihan hanya untuk bulan 1, 2, 3
            for ($m = 1; $m <= 3; $m++) {
                Tagihan::create([
                    'rumah_id' => $rumahList[15]->id,
                    'penghuni_id' => $p16->id,
                    'bulan' => $m,
                    'tahun' => $currentYear,
                    'nominal_kebersihan' => 15000,
                    'nominal_satpam' => 100000,
                    'status_kebersihan' => 'Lunas',
                    'status_satpam' => 'Lunas',
                ]);
            }
        }

        // A17: Pernah dihuni Apr - Jun (Sekarang Kosong atau Aktif tergantung currentMonth)
        if ($currentMonth >= 4) {
            $endMonth17 = min(6, $currentMonth);
            $p17 = Penghuni::create([
                'nama_lengkap' => $faker->name,
                'status_penghuni' => 'Kontrak',
                'nomor_telepon' => $faker->phoneNumber,
                'status_pernikahan' => 'Menikah'
            ]);
            $rumahList[16]->penghuni()->attach($p17->id, [
                'tanggal_mulai' => Carbon::createFromDate($currentYear, 4, 1)->toDateString(),
                'tanggal_selesai' => $endMonth17 == 6 && $currentMonth > 6 ? Carbon::createFromDate($currentYear, 6, 30)->toDateString() : null
            ]);
            if ($endMonth17 == $currentMonth || ($endMonth17 == 6 && $currentMonth == 6)) {
                $rumahList[16]->update(['status_dihuni' => 'Dihuni']);
            }
            
            for ($m = 4; $m <= $endMonth17; $m++) {
                Tagihan::create([
                    'rumah_id' => $rumahList[16]->id,
                    'penghuni_id' => $p17->id,
                    'bulan' => $m,
                    'tahun' => $currentYear,
                    'nominal_kebersihan' => 15000,
                    'nominal_satpam' => 100000,
                    'status_kebersihan' => 'Lunas',
                    'status_satpam' => 'Lunas',
                ]);
            }
        }

        // A18: Aktif Dihuni Kontrak dari Bulan Lalu - Sekarang
        $start18 = max(1, $currentMonth - 1);
        $p18 = Penghuni::create([
            'nama_lengkap' => $faker->name,
            'status_penghuni' => 'Kontrak',
            'nomor_telepon' => $faker->phoneNumber,
            'status_pernikahan' => 'Belum Menikah'
        ]);
        $rumahList[17]->penghuni()->attach($p18->id, [
            'tanggal_mulai' => Carbon::createFromDate($currentYear, $start18, 1)->toDateString(),
            'tanggal_selesai' => null
        ]);
        $rumahList[17]->update(['status_dihuni' => 'Dihuni']);
        for ($m = $start18; $m <= $currentMonth; $m++) {
            $isPaid = ($m == $currentMonth) ? $faker->boolean(50) : true;
            Tagihan::create([
                'rumah_id' => $rumahList[17]->id,
                'penghuni_id' => $p18->id,
                'bulan' => $m,
                'tahun' => $currentYear,
                'nominal_kebersihan' => 15000,
                'nominal_satpam' => 100000,
                'status_kebersihan' => $isPaid ? 'Lunas' : 'Belum Lunas',
                'status_satpam' => $isPaid ? 'Lunas' : 'Belum Lunas',
            ]);
        }

        // A19: Kosong Sepenuhnya (Tidak pernah dihuni tahun ini)
        
        // A20: Kosong Sepenuhnya (Tidak pernah dihuni tahun ini)

        // 5. Generate Pengeluaran (Bulanan & Insidental)
        for ($m = 1; $m <= $currentMonth; $m++) {
            // Pengeluaran Bulanan Rutin
            Pengeluaran::create([
                'keterangan' => "Gaji Satpam Bulan " . $m,
                'jumlah' => 2500000,
                'tanggal' => Carbon::createFromDate($currentYear, $m, 25)->toDateString()
            ]);

            Pengeluaran::create([
                'keterangan' => "Token Listrik Pos Satpam Bulan " . $m,
                'jumlah' => 200000,
                'tanggal' => Carbon::createFromDate($currentYear, $m, 5)->toDateString()
            ]);

            // Pengeluaran Insidental (Acak di beberapa bulan tertentu)
            if ($m == 2) {
                Pengeluaran::create([
                    'keterangan' => "Perbaikan Selokan RT",
                    'jumlah' => 1500000,
                    'tanggal' => Carbon::createFromDate($currentYear, $m, 12)->toDateString()
                ]);
            }

            if ($m == 5) {
                Pengeluaran::create([
                    'keterangan' => "Pengecatan Marka & Perbaikan Jalan",
                    'jumlah' => 3000000,
                    'tanggal' => Carbon::createFromDate($currentYear, $m, 18)->toDateString()
                ]);
            }
            
            if ($m == 7) {
                Pengeluaran::create([
                    'keterangan' => "Pembelian Alat Kebersihan & Tong Sampah",
                    'jumlah' => 850000,
                    'tanggal' => Carbon::createFromDate($currentYear, $m, 10)->toDateString()
                ]);
            }
        }
    }
}
