<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penghuni extends Model
{
    use HasFactory;

    protected $table = 'penghuni';

    protected $fillable = [
        'nama_lengkap',
        'foto_ktp',
        'status_penghuni',
        'nomor_telepon',
        'status_pernikahan',
    ];

    public function rumah()
    {
        return $this->belongsToMany(Rumah::class, 'penghuni_rumah', 'penghuni_id', 'rumah_id')
                    ->withPivot('id', 'tanggal_mulai', 'tanggal_selesai')
                    ->withTimestamps();
    }
    
    public function tagihan()
    {
        return $this->hasMany(Tagihan::class, 'penghuni_id');
    }
}
