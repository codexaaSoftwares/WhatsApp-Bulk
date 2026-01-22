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
        Schema::create('message_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('campaigns')->onDelete('cascade');
            $table->foreignId('contact_id')->constrained('contacts')->onDelete('restrict');
            $table->foreignId('whatsapp_number_id')->constrained('whatsapp_numbers')->onDelete('restrict');
            $table->foreignId('template_id')->constrained('templates')->onDelete('restrict');
            $table->string('wa_message_id')->nullable(); // From Meta API
            $table->string('mobile_number', 20); // Denormalized for performance
            $table->text('message_content'); // Final rendered message
            $table->enum('status', ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'])->default('PENDING');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->unsignedInteger('retry_count')->default(0);
            $table->timestamps();

            // Critical indexes for performance
            $table->index('campaign_id');
            $table->index('contact_id');
            $table->index('whatsapp_number_id');
            $table->index('template_id');
            $table->index('mobile_number');
            $table->index('status');
            $table->index('wa_message_id');
            $table->index('created_at');
            $table->index(['campaign_id', 'status']); // Composite for campaign stats
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('message_logs');
    }
};

