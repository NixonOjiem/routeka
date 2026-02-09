<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->string('google_id')->nullable()->after('id');
            $table->string('password')->nullable()->change(); // Make password optional
            $table->string('avatar')->nullable()->after('user_name'); // Optional: store google avatar
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->dropColumn('google_id');
            $table->dropColumn('avatar');
            $table->string('password')->nullable(false)->change();
        });
    }
};
