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
    Schema::create('reports', function (Blueprint $table) {
        $table->id();
        $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
        $table->unsignedBigInteger('reportable_id');
        $table->enum('reportable_type', ['post', 'comment', 'user']);
        $table->enum('reason', ['spam', 'harassment', 'inappropriate', 'other']);
        $table->enum('status', ['pending', 'reviewed', 'dismissed'])->default('pending');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
