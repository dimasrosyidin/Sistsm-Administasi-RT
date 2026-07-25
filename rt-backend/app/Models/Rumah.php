<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rumah extends Model
{
    use HasFactory;

    protected $table = 'rumah';

    protected $fillable = [
        'nomor_rumah',
        'status_dihuni',
    ];

    public function penghuni()
    {
        return $this->belongsToMany(Penghuni::class, 'penghuni_rumah', 'rumah_id', 'penghuni_id')
                    ->withPivot('id', 'tanggal_mulai', 'tanggal_selesai')
                    ->withTimestamps();
    }

    public function tagihan()
    {
        return $this->hasMany(Tagihan::class, 'rumah_id');
    }
}
