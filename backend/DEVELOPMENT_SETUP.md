# 🛠️ Development Setup Guide

## ⚠️ Important: Queue Processing

This project is configured to work **the same way in development and production** (Hostinger).

**We use Laravel Task Scheduler instead of long-running `queue:work` process.**

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env`:
```env
QUEUE_CONNECTION=database
```

### 3. Run Migrations

```bash
php artisan migrate
php artisan db:seed
```

### 4. Start Development Server

**Terminal 1 - Laravel Server:**
```bash
php artisan serve
```

**Terminal 2 - Task Scheduler (IMPORTANT!):**
```bash
php artisan schedule:work
```

**That's it!** The scheduler will process queue jobs automatically.

---

## 🔄 How It Works

### Development (Same as Production!)

```
php artisan schedule:work
    ↓
Runs scheduler every minute (simulates cron)
    ↓
Executes: queue:work --stop-when-empty
    ↓
Processes all pending jobs
    ↓
Waits for next minute
    ↓
Repeats...
```

### Production (Hostinger)

```
Cron Job (every minute)
    ↓
php artisan schedule:run
    ↓
Same scheduler logic
    ↓
Same queue processing
```

**Result:** ✅ Same behavior in dev and production!

---

## 📝 Development Commands

### Start Scheduler (Recommended)
```bash
php artisan schedule:work
```
- Runs scheduler continuously
- Processes queue every minute
- Same as production behavior
- Auto-reloads on code changes

### Alternative: Manual Queue Processing
```bash
# Process queue once
php artisan queue:work --stop-when-empty

# Process queue with verbose output
php artisan queue:work --stop-when-empty --verbose
```

### Check Queue Status
```bash
php artisan queue:monitor
```

### View Failed Jobs
```bash
php artisan queue:failed
```

### Retry Failed Jobs
```bash
php artisan queue:retry all
```

---

## 🧪 Testing Flow

1. **Start Laravel Server:**
   ```bash
   php artisan serve
   ```

2. **Start Scheduler:**
   ```bash
   php artisan schedule:work
   ```

3. **Create Campaign via API:**
   ```bash
   POST http://localhost:8000/api/campaigns
   ```

4. **Start Campaign:**
   ```bash
   POST http://localhost:8000/api/campaigns/{id}/start
   ```

5. **Watch Scheduler Process Jobs:**
   - Scheduler will pick up jobs automatically
   - Check logs: `storage/logs/laravel.log`
   - Check queue: `php artisan queue:monitor`

---

## 🔍 Monitoring

### Check Jobs Table
```bash
php artisan tinker
>>> DB::table('jobs')->count();
```

### Watch Logs
```bash
tail -f storage/logs/laravel.log
```

### Check Scheduler Tasks
```bash
php artisan schedule:list
```

---

## ⚡ Quick Scripts

Create these scripts for convenience:

### `dev-start.sh` (Linux/Mac)
```bash
#!/bin/bash
php artisan serve &
php artisan schedule:work
```

### `dev-start.bat` (Windows)
```batch
@echo off
start "Laravel Server" php artisan serve
php artisan schedule:work
```

---

## 🎯 Key Points

✅ **Same setup for dev and production**
✅ **No need to remember different commands**
✅ **Scheduler handles everything automatically**
✅ **Works perfectly on Hostinger**

---

## 🐛 Troubleshooting

### Jobs Not Processing?
1. Make sure scheduler is running: `php artisan schedule:work`
2. Check `jobs` table: `SELECT * FROM jobs;`
3. Check logs: `storage/logs/laravel.log`

### Scheduler Not Running?
- Verify `QUEUE_CONNECTION=database` in `.env`
- Run migrations: `php artisan migrate`
- Check Laravel logs for errors

---

**Remember:** Always use `php artisan schedule:work` in development, just like cron in production! 🚀

