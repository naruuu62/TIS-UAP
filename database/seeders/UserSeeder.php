<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name'       => 'Admin Utama',
                'email'      => 'admin@utp.com',
                'password'   => Hash::make('password'),
                'role'       => 'admin',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name'       => 'Budi Santoso',
                'email'      => 'budi@gmail.com',
                'password'   => Hash::make('password'),
                'role'       => 'seller',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name'       => 'Siti Rahayu',
                'email'      => 'siti@gmail.com',
                'password'   => Hash::make('password'),
                'role'       => 'seller',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name'       => 'Ahmad Fauzi',
                'email'      => 'ahmad@gmail.com',
                'password'   => Hash::make('password'),
                'role'       => 'buyer',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name'       => 'Dewi Lestari',
                'email'      => 'dewi@gmail.com',
                'password'   => Hash::make('password'),
                'role'       => 'buyer',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name'       => 'Rizky Pratama',
                'email'      => 'rizky@gmail.com',
                'password'   => Hash::make('password'),
                'role'       => 'buyer',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];
        DB::table('users')->insert($users);

    }
}
