<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LostFound extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'type', 'title', 'description', 'location', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function media()
    {
        return $this->hasMany(LostFoundMedia::class)->orderBy('order');
    }

    public function claims()
    {
        return $this->hasMany(Claim::class);
    }
}