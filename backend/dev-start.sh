#!/bin/bash

echo "========================================"
echo " WhatsApp Bulk Sender - Development"
echo "========================================"
echo ""
echo "Starting Laravel server..."
php artisan serve &
sleep 2
echo ""
echo "Starting Queue Scheduler..."
echo "This will process queue jobs every minute (same as production!)"
echo ""
php artisan schedule:work

