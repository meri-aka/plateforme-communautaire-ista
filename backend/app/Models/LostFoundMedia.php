<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LostFoundMedia extends Model
{
    use HasFactory;

    protected $fillable = ['lost_found_id', 'url', 'order'];

    public function lostFound()
    {
        return $this->belongsTo(LostFound::class);
    }
}