<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view issues',
            'create issues',
            'update issues',
            'delete issues',
            'verify issues',
            'assign issues',
            'resolve issues',
            'view dashboard',
            'manage users',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $citizen = Role::create(['name' => 'citizen']);
        $citizen->givePermissionTo(['view issues', 'create issues']);

        $officer = Role::create(['name' => 'officer']);
        $officer->givePermissionTo([
            'view issues',
            'create issues',
            'update issues',
            'verify issues',
            'assign issues',
            'resolve issues',
            'view dashboard',
        ]);

        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());
    }
}
