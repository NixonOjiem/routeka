<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            $table->enum('status', ['pending', 'accepted', 'completed', 'cancelled'])
                  ->default('pending');
                  //->after('dropoff_address');
        });
    }

    public function down()
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
