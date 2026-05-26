<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('processing_logs', function (Blueprint $table) {

            $table->foreignId('raw_input_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete()
                ->after('id');

            $table->string('step_name')
                ->after('raw_input_id');

            $table->string('status')
                ->default('success')
                ->after('step_name');

            $table->text('message')
                ->nullable()
                ->after('status');

            $table->json('metadata_json')
                ->nullable()
                ->after('message');
        });
    }

    public function down(): void
    {
        Schema::table('processing_logs', function (Blueprint $table) {

            $table->dropForeign(['raw_input_id']);

            $table->dropColumn([
                'raw_input_id',
                'step_name',
                'status',
                'message',
                'metadata_json',
            ]);
        });
    }
};