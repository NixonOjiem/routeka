<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ride_requests', function (Blueprint $table) {
            $table->id();

            // Nullable because a user might be a guest
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

            // Guest details (filled if user_id is null)
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();

            // Trip Details
            $table->decimal('pickup_lat', 10, 8);
            $table->decimal('pickup_lng', 11, 8);
            $table->decimal('dropoff_lat', 10, 8);
            $table->decimal('dropoff_lng', 11, 8);

            // Scheduling
            $table->dateTime('commute_time'); // When do they want to leave?
            $table->string('frequency'); // e.g., "daily", "once", "weekly"

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ride_requests');
    }
};
