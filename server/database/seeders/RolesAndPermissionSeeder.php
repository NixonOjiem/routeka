<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        //resources that need permision
        $entities = ['groups', 'users', 'chatrooms', 'chatmessages', 'riderequests'];
        $actions = ['create', 'read', 'update', 'delete'];

        //create all permisions
        foreach ($entities as $entity) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$action} {$entity}", 'guard_name' => 'api']);
            }
        }

        //creating roles
        $superAdminRole = Role::firstOrCreate(['name' => 'superAdmin', 'guard_name' => 'api']);
    }
}
