<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('image')->nullable()->after('body');
            $table->text('body')->nullable()->change();
        });

        Schema::table('group_messages', function (Blueprint $table) {
            $table->string('image')->nullable()->after('body');
            $table->text('body')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('image');
            $table->text('body')->nullable(false)->change();
        });

        Schema::table('group_messages', function (Blueprint $table) {
            $table->dropColumn('image');
            $table->text('body')->nullable(false)->change();
        });
    }
};
