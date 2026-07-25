<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin RT',
            'email' => 'admin@rt.local',
        ]);

        $faker = \Faker\Factory::create('id_ID');

        // Create 20 Penghuni
        $penghuniList = [];
        for ($i = 1; $i <= 20; $i++) {
            $penghuniList[] = \App\Models\Penghuni::create([
                'nama_lengkap' => $faker->name,
                'status_penghuni' => $faker->randomElement(['Tetap', 'Kontrak']),
                'nomor_telepon' => $faker->phoneNumber,
                'status_pernikahan' => $faker->randomElement(['Menikah', 'Belum Menikah']),
                'foto_ktp' => null
            ]);
        }

        // Create 11 Rumah
        $rumahList = [];
        for ($i = 1; $i <= 11; $i++) {
            $rumahList[] = \App\Models\Rumah::create([
                'nomor_rumah' => 'A' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'status_dihuni' => $i <= 10 ? 'Dihuni' : 'Tidak Dihuni'
            ]);
        }

        // Assign 2 Penghuni to the first 10 Rumah
        $bulan = (int)date('n');
        $tahun = (int)date('Y');
        $penghuniIndex = 0;

        for ($i = 0; $i < 10; $i++) {
            $rumah = $rumahList[$i];
            $penghuni1 = $penghuniList[$penghuniIndex++];
            $penghuni2 = $penghuniList[$penghuniIndex++];

            $rumah->penghuni()->attach([
                $penghuni1->id => ['tanggal_mulai' => now()->subMonths(rand(1, 12))->toDateString()],
                $penghuni2->id => ['tanggal_mulai' => now()->subMonths(rand(1, 12))->toDateString()]
            ]);

            // Create tagihan unpaid, linked to first penghuni for simplicity
            \App\Models\Tagihan::create([
                'rumah_id' => $rumah->id,
                'penghuni_id' => $penghuni1->id,
                'bulan' => $bulan,
                'tahun' => $tahun,
                'nominal_kebersihan' => 15000,
                'nominal_satpam' => 100000,
                'status_kebersihan' => 'Belum Lunas',
                'status_satpam' => 'Belum Lunas',
            ]);
        }
    }
}
