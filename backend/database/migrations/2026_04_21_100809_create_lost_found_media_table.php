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
    Schema::create('lost_found_media', function (Blueprint $table) {
        $table->id();
        $table->foreignId('lost_found_id')->constrained('lost_founds')->cascadeOnDelete();
        $table->string('url');
        $table->integer('order')->default(0);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lost_found_media');
    }
};
