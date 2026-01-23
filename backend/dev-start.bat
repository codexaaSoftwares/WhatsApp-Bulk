@echo off
echo ========================================
echo  WhatsApp Bulk Sender - Development
echo ========================================
echo.
echo Starting Laravel server...
start "Laravel Server" cmd /k "php artisan serve"
timeout /t 2 /nobreak >nul
echo.
echo Starting Queue Scheduler...
echo This will process queue jobs every minute (same as production!)
echo.
php artisan schedule:work

