<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('penghuni', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->string('foto_ktp')->nullable();
            $table->enum('status_penghuni', ['Kontrak', 'Tetap']);
            $table->string('nomor_telepon');
            $table->enum('status_pernikahan', ['Menikah', 'Belum Menikah']);
            $table->timestamps();
        });

        Schema::create('rumah', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_rumah')->unique();
            $table->enum('status_dihuni', ['Dihuni', 'Tidak Dihuni'])->default('Tidak Dihuni');
            $table->timestamps();
        });

        Schema::create('penghuni_rumah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rumah_id')->constrained('rumah')->onDelete('cascade');
            $table->foreignId('penghuni_id')->constrained('penghuni')->onDelete('cascade');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->timestamps();
        });

        Schema::create('tagihan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rumah_id')->constrained('rumah')->onDelete('cascade');
            $table->foreignId('penghuni_id')->constrained('penghuni')->onDelete('cascade');
            $table->integer('bulan');
            $table->integer('tahun');
            $table->integer('nominal_kebersihan')->default(15000);
            $table->integer('nominal_satpam')->default(100000);
            $table->enum('status_kebersihan', ['Lunas', 'Belum Lunas'])->default('Belum Lunas');
            $table->enum('status_satpam', ['Lunas', 'Belum Lunas'])->default('Belum Lunas');
            $table->date('tanggal_bayar_kebersihan')->nullable();
            $table->date('tanggal_bayar_satpam')->nullable();
            $table->timestamps();
        });

        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->id();
            $table->string('keterangan');
            $table->integer('jumlah');
            $table->date('tanggal');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluaran');
        Schema::dropIfExists('tagihan');
        Schema::dropIfExists('penghuni_rumah');
        Schema::dropIfExists('rumah');
        Schema::dropIfExists('penghuni');
    }
};
