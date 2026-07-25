<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;

    protected $table = 'tagihan';

    protected $fillable = [
        'rumah_id',
        'penghuni_id',
        'bulan',
        'tahun',
        'nominal_kebersihan',
        'nominal_satpam',
        'status_kebersihan',
        'status_satpam',
        'tanggal_bayar_kebersihan',
        'tanggal_bayar_satpam'
    ];

    public function rumah()
    {
        return $this->belongsTo(Rumah::class, 'rumah_id');
    }

    public function penghuni()
    {
        return $this->belongsTo(Penghuni::class, 'penghuni_id');
    }
}
