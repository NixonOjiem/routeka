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

        //Create all standard CRUD permissions
        foreach ($entities as $entity) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$action} {$entity}", 'guard_name' => 'api']);
            }
        }

        //Create custom specific permissions
        Permission::firstOrCreate(['name' => 'assign group-admin', 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => 'remove group-members', 'guard_name' => 'api']);

        //Create Roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        $groupAdminRole = Role::firstOrCreate(['name' => 'group-admin', 'guard_name' => 'api']);
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'api']);
        $memberRole = Role::firstOrCreate(['name' => 'member', 'guard_name' => 'api']);

        //Assign Permissions to Roles

        //Super Admin gets EVERYTHING
        $superAdminRole->syncPermissions(Permission::all());

        // Group Admin: Can manage their groups, chatrooms, read users (to add them), and promote others
        $groupAdminRole->syncPermissions([
            'read groups',
            'update groups',
            'delete groups',
            'read chatrooms',
            'update chatrooms',
            'create chatmessages',
            'read chatmessages',
            'delete chatmessages',
            'read users',
            'assign group-admin', // Explicit permission to promote others
            'remove group-members'
        ]);

        // Standard User: Can request groups, match rides, and read standard resources
        $userRole->syncPermissions([
            'create groups',
            'read groups',
            'create riderequests',
            'read riderequests',
            'update riderequests',
            'delete riderequests',
            'read chatrooms',
            'create chatmessages',
            'read chatmessages'
        ]);

        // Member: Bare minimum to participate in an assigned group
        $memberRole->syncPermissions([
            'read groups',
            'read chatrooms',
            'create chatmessages',
            'read chatmessages'
        ]);

        //Create the default Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'], // Ensure no duplicates
            [
                'name' => 'System Super Admin',
                'user_name' => 'super_admin',
                'password' => Hash::make('password123'), // Change this in production
                'email_verified_at' => now(), // Automatically verified
            ]
        );

        // Assign the super-admin role to this user (guarding against duplicate assignment errors)
        if (!$superAdmin->hasRole('super-admin')) {
            $superAdmin->assignRole('super-admin');
        }
    }
}
