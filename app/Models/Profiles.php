<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profiles extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'address',
        'phone',
        'bio',
    ];

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id');
    }
}
