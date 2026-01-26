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
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_id')->unique(); // Unique identifier for the room
            $table->string('name')->nullable(); // Optional room name
            $table->json('ride_ids'); // Array of ride request IDs in this room
            $table->json('user_ids')->nullable(); // Array of user IDs in this room
            $table->string('pickup_grid'); // Grid identifier for pickup (1 mile)
            $table->string('dropoff_grid'); // Grid identifier for dropoff (1 mile)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_rooms');
    }
};
