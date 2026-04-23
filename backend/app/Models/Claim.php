<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    use HasFactory;

    protected $fillable = ['lost_found_id', 'user_id', 'message', 'status'];

    public function lostFound()
    {
        return $this->belongsTo(LostFound::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}