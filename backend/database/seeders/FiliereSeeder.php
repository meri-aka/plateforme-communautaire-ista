<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Filiere;

class FiliereSeeder extends Seeder
{
    public function run(): void
    {
        Filiere::insert([
            ['name' => 'Développement Digital',  'code' => 'DEV', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Infrastructure Digitale', 'code' => 'ID',  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Intelligence Artificielle','code' => 'IA',  'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}