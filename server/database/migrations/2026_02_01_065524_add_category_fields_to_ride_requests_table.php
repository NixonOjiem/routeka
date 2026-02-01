<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            //
                 // The type of travel (neighborhood, corporate, etc.)
        $table->string('category')->default('neighborhood')->after('status');

        // Flexible storage for category-specific details
        $table->json('category_metadata')->nullable()->after('category');

        // Indexing the category for faster searching/filtering
        $table->index('category');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            //
            $table->dropIndex(['category']);
            // Drop the columns
            $table->dropColumn('category_metadata'); $table->dropColumn('category');

        });
    }
};
