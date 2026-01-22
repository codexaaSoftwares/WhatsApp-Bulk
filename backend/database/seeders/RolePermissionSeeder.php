<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = Role::whereIn('name', ['manager', 'staff'])->get()->keyBy('name');

        if ($roles->isEmpty()) {
            return;
        }

        $managerPermissionNames = [
            'view_user',
            'view_role',
            'view_permission',
            'view_setting',
            'edit_setting',
            'view_dashboard',
        ];

        $staffPermissionNames = [
            'view_dashboard',
        ];

        if ($manager = $roles->get('manager')) {
            $managerPermissions = Permission::whereIn('name', $managerPermissionNames)->pluck('id');
            $manager->permissions()->syncWithoutDetaching($managerPermissions);
        }

        if ($staff = $roles->get('staff')) {
            $staffPermissions = Permission::whereIn('name', $staffPermissionNames)->pluck('id');
            $staff->permissions()->syncWithoutDetaching($staffPermissions);
        }
    }
}

