<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Resources that need permissions
        $entities = ['groups', 'users', 'chatrooms', 'chatmessages', 'riderequests'];
        $actions = ['create', 'read', 'update', 'delete'];

        // 1. Create all standard CRUD permissions
        foreach ($entities as $entity) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$action} {$entity}", 'guard_name' => 'api']);
            }
        }

        //  Create Global Roles ONLY
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'api']);

        // Assign Permissions to Roles

        // Super Admin gets EVERYTHING
        $superAdminRole->syncPermissions(Permission::all());

        // Standard User gets baseline permissions.
        // Note:Laravel Policy will strictly check the pivot table before allowing them to actually use the 'update groups' or 'delete groups' permissions.
        $userRole->syncPermissions([
            'create groups',
            'read groups',
            'update groups',
            'delete groups',
            'create riderequests',
            'read riderequests',
            'update riderequests',
            'delete riderequests',
            'read chatrooms',
            'update chatrooms',
            'create chatmessages',
            'read chatmessages'
        ]);

        // Create the default Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@app.com.com'],
            [
                'name' => 'System Super Admin',
                'user_name' => 'superadmin',
                'password' => Hash::make('secret@12345'),
                'email_verified_at' => now(),
            ]
        );

        // Assign the super-admin role to this user
        if (!$superAdmin->hasRole('super-admin')) {
            $superAdmin->assignRole('super-admin');
        }
    }
}
