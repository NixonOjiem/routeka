<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatRoomRideRequestTable extends Migration
{
    public function up()
    {
        Schema::create('chat_room_ride_request', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained()->onDelete('cascade');
            $table->foreignId('ride_request_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['chat_room_id', 'ride_request_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_room_ride_request');
    }
}
