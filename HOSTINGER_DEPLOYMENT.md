# 🚀 Hostinger Deployment Guide - WhatsApp Bulk Sender

## 📋 Overview

This guide covers deploying the WhatsApp Bulk Message Sender on **Hostinger Shared Hosting**.

---

## ⚠️ Important: Queue Processing

**This project uses the SAME approach for development and production!**

**We use Laravel Task Scheduler** instead of long-running `queue:work`:
- ✅ Works in development: `php artisan schedule:work`
- ✅ Works in production: Cron job runs `php artisan schedule:run`
- ✅ Same behavior everywhere
- ✅ No confusion between dev and production

**Why?** `php artisan queue:work` is a long-running process that:
- Runs continuously (not suitable for shared hosting)
- Gets killed on shared hosting
- Requires VPS/dedicated server

**Our solution:** Scheduler processes queue every minute (works everywhere!)

---

## 🔧 Setup Steps

### 1. Upload Files to Hostinger

1. Upload all project files to your Hostinger hosting
2. Ensure `backend/` folder is in your public_html or a subdirectory
3. Set proper file permissions:
   ```bash
   chmod -R 755 storage bootstrap/cache
   chmod -R 775 storage bootstrap/cache
   ```

### 2. Configure Environment Variables

Edit `.env` file on Hostinger:

```env
APP_NAME="WhatsApp Bulk Sender"
APP_ENV=production
APP_KEY=base64:your_generated_key_here
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Queue (IMPORTANT: Use database driver)
QUEUE_CONNECTION=database

# WhatsApp Cloud API
WHATSAPP_API_BASE_URL=https://graph.facebook.com/v18.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token_here
WHATSAPP_APP_SECRET=your_app_secret_here

# Frontend URL
FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
```

### 3. Install Dependencies

Via SSH or Hostinger File Manager Terminal:

```bash
cd /path/to/your/backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Run Migrations

```bash
php artisan migrate --force
```

### 5. Setup Cron Job (CRITICAL)

This is the **most important step** for queue processing on shared hosting.

#### Option A: Via Hostinger cPanel Cron Jobs

1. Login to Hostinger cPanel
2. Go to **Cron Jobs**
3. Add a new cron job with these settings:

**Cron Command:**
```bash
cd /home/username/public_html/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

**OR if you have a different PHP path:**
```bash
cd /home/username/public_html/backend && php artisan schedule:run >> /dev/null 2>&1
```

**Schedule:** Every Minute (`* * * * *`)

**Full cron syntax:**
```
* * * * * cd /home/username/public_html/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

#### Option B: Direct Queue Processing (Alternative)

If you prefer to process queue directly without scheduler:

```bash
* * * * * cd /home/username/public_html/backend && /usr/bin/php artisan queue:work --stop-when-empty --tries=3 >> /dev/null 2>&1
```

**Note:** Replace `/home/username/public_html/backend` with your actual path.

### 6. Find Your PHP Path

To find the correct PHP path on Hostinger:

1. Create a file `phpinfo.php` in your backend folder:
   ```php
   <?php phpinfo(); ?>
   ```
2. Access it via browser: `https://yourdomain.com/backend/phpinfo.php`
3. Look for "System" → "Server API" and note the PHP path
4. Use that path in your cron job
5. **Delete phpinfo.php** after checking (security)

### 7. Test Cron Job

Create a test file to verify cron is working:

```bash
# Create test file
echo "Cron test: $(date)" >> /home/username/public_html/backend/storage/logs/cron-test.log
```

Add to cron:
```
* * * * * echo "Cron test: $(date)" >> /home/username/public_html/backend/storage/logs/cron-test.log
```

Check the log file after 1-2 minutes to verify it's running.

---

## 🔍 How It Works

### Development (Local) - SAME AS PRODUCTION!
```bash
# Run scheduler (simulates cron)
php artisan schedule:work
    ↓
# Scheduler runs this command every minute
php artisan queue:work --stop-when-empty
    ↓
# Processes all pending jobs, then stops
# Scheduler runs it again next minute
```

### Production (Hostinger Shared Hosting) - SAME AS DEVELOPMENT!
```bash
# Cron runs every minute
php artisan schedule:run
    ↓
# Scheduler runs this command (same as dev!)
php artisan queue:work --stop-when-empty
    ↓
# Processes all pending jobs, then stops
# Cron runs it again next minute
```

**Result:** ✅ **Identical behavior in dev and production!**

**Key Difference:**
- `queue:work` = Runs forever (not suitable for shared hosting)
- `queue:work --stop-when-empty` = Processes jobs, then exits (cron-friendly)

---

## 📝 Laravel Task Scheduler Configuration

The scheduler is already configured in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Process queued jobs every minute
    $schedule->command('queue:work --stop-when-empty --tries=3')
        ->everyMinute()
        ->withoutOverlapping()
        ->runInBackground();
}
```

This means:
- ✅ Runs every minute via cron
- ✅ Processes all pending jobs
- ✅ Stops when queue is empty
- ✅ Prevents overlapping executions
- ✅ Perfect for shared hosting

---

## 🧪 Testing Queue Processing

### 1. Create a Test Campaign
```bash
# Via API or frontend
POST /api/campaigns
```

### 2. Start the Campaign
```bash
POST /api/campaigns/{id}/start
```

### 3. Check Queue Status
```bash
# Check jobs table
php artisan tinker
>>> DB::table('jobs')->count();
```

### 4. Monitor Logs
```bash
tail -f storage/logs/laravel.log
```

### 5. Verify Cron is Running
Check `storage/logs/cron-test.log` (if you created the test)

---

## 🔐 Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Set strong `APP_KEY`
- [ ] Set `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- [ ] Set `WHATSAPP_APP_SECRET`
- [ ] Remove `phpinfo.php` if created
- [ ] Set proper file permissions
- [ ] Enable HTTPS/SSL
- [ ] Configure webhook URL in Meta Dashboard

---

## 🌐 Webhook Configuration

### 1. Get Your Webhook URL
```
https://yourdomain.com/api/webhooks/whatsapp
```

### 2. Configure in Meta Dashboard
1. Go to Meta for Developers
2. Select your WhatsApp app
3. Go to Configuration → Webhooks
4. Add webhook URL
5. Set verify token (same as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
6. Subscribe to: `messages`, `message_status`

### 3. Test Webhook
Meta will send a GET request to verify. Your endpoint should return the challenge.

---

## 🐛 Troubleshooting

### Cron Not Running
1. Check cron job syntax in cPanel
2. Verify PHP path is correct
3. Check file permissions
4. Check cron logs in cPanel

### Jobs Not Processing
1. Verify cron is running: `storage/logs/cron-test.log`
2. Check `jobs` table: `SELECT * FROM jobs;`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Verify `QUEUE_CONNECTION=database` in `.env`

### Permission Errors
```bash
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R username:username storage bootstrap/cache
```

### Queue Jobs Failing
```bash
# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

---

## 📊 Monitoring

### Check Queue Status
```bash
php artisan queue:monitor
```

### View Failed Jobs
```bash
php artisan queue:failed
```

### Process Failed Jobs
```bash
php artisan queue:retry all
```

---

## 🚀 Performance Tips

1. **Optimize Autoloader:**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

2. **Cache Configuration:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Database Indexes:**
   - Already configured in migrations
   - Monitor slow queries

4. **Queue Chunking:**
   - Already configured in `config/whatsapp.php`
   - Adjust `chunk_size` if needed

---

## 📞 Support

If you encounter issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check cron logs in Hostinger cPanel
3. Verify all environment variables
4. Test cron job manually via SSH

---

## ✅ Deployment Checklist

- [ ] Files uploaded to Hostinger
- [ ] `.env` configured with production values
- [ ] Dependencies installed (`composer install`)
- [ ] Migrations run (`php artisan migrate`)
- [ ] Cron job configured (every minute)
- [ ] Cron job tested and working
- [ ] Webhook URL configured in Meta Dashboard
- [ ] SSL/HTTPS enabled
- [ ] File permissions set correctly
- [ ] `APP_DEBUG=false`
- [ ] Test campaign creation
- [ ] Test message sending
- [ ] Test webhook receiving

---

**Last Updated:** 2025-01-23  
**Status:** ✅ Ready for Hostinger Deployment

