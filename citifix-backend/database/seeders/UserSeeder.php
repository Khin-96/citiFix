<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'points' => 0,
        ]);
        $admin->assignRole('admin');

        // Create officer user
        $officer = User::create([
            'name' => 'Officer Smith',
            'email' => 'officer@example.com',
            'password' => Hash::make('password'),
            'points' => 0,
        ]);
        $officer->assignRole('officer');

        // Create citizen users
        $citizen1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'points' => 50,
        ]);
        $citizen1->assignRole('citizen');

        $citizen2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'points' => 75,
        ]);
        $citizen2->assignRole('citizen');
    }
}
