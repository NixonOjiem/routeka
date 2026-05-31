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
        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->string('pickup_grid')->nullable()->change();
            $table->string('dropoff_grid')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->string('pickup_grid')->nullable(false)->change();
            $table->string('dropoff_grid')->nullable(false)->change();
        });
    }
};
