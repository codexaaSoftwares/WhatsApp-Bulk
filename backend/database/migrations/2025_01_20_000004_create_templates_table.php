<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('language', 10)->default('en');
            $table->enum('category', ['MARKETING', 'UTILITY', 'AUTHENTICATION'])->default('MARKETING');
            $table->text('body');
            $table->enum('header_type', ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'])->nullable();
            $table->text('header_content')->nullable();
            $table->text('footer')->nullable();
            $table->json('buttons')->nullable();
            $table->json('variables'); // Array of variable names
            $table->enum('status', ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'])->default('DRAFT');
            $table->string('meta_template_id')->nullable(); // ID from Meta
            $table->timestamps();

            $table->index('status');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('templates');
    }
};

