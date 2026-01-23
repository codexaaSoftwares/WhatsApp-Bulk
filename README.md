# WhatsApp Bulk Message Sender

A comprehensive web application for sending bulk WhatsApp messages to multiple customers individually using Meta's Official WhatsApp Cloud API.

## 🚀 Quick Start

### Frontend (Admin Panel)

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the admin panel.

### Backend (API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

**Start Development (2 terminals needed):**

**Terminal 1:**
```bash
php artisan serve
```

**Terminal 2:**
```bash
php artisan schedule:work
```

**OR use helper script:**
- Windows: `dev-start.bat`
- Linux/Mac: `chmod +x dev-start.sh && ./dev-start.sh`

API will be available at [http://localhost:8000/api](http://localhost:8000/api)

## 📦 Tech Stack

**Frontend:**
- React 19
- Vite
- React Bootstrap
- CoreUI React

**Backend:**
- Laravel 9
- MySQL
- Laravel Sanctum (Authentication)
- Laravel Queue (Background Jobs)
- Guzzle HTTP (WhatsApp API Integration)

## 📁 Project Structure

```
WhatsApp-Bulk/
├── admin/          # React frontend (admin panel)
├── backend/        # Laravel API backend
├── Scope/          # Project scope and BRD
└── structure & development guideline/  # Documentation
```

## 📋 Project Documentation

- **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)** - Complete development plan from cleanup to deployment
- **[QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)** - Step-by-step checklist to get started
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database schema and relationships
- **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** - Complete guide for deploying on Hostinger shared hosting
- **[Scope/📘 BRD _ Project Scope.md](./Scope/📘%20BRD%20_%20Project%20Scope.md)** - Business Requirements Document

## 🔧 Environment Setup

1. Copy `admin/env.example` to `admin/.env.local`
2. Copy `backend/env.example` to `backend/.env`
3. Update database credentials and API URLs
4. Run migrations and seeders

## 📝 Development

**Terminal 1 - Frontend:**
```bash
cd admin && npm run dev
```

**Terminal 2 - Backend API:**
```bash
cd backend && php artisan serve
```

**Terminal 3 - Queue Scheduler (IMPORTANT!):**
```bash
cd backend && php artisan schedule:work
```

**Note:** We use `schedule:work` in development (same as production cron). This ensures dev and production work identically! See [DEVELOPMENT_SETUP.md](./backend/DEVELOPMENT_SETUP.md) for details.

---

## 🎯 Project Status

**Current Phase**: API Integration & Testing  
**Status**: Ready for Testing  
**Version**: 1.0.0-beta

## 📚 Key Features

- ✅ Connect WhatsApp Business number via Cloud API
- ✅ Manage customer contacts (import CSV/Excel)
- ✅ Create and manage WhatsApp message templates
- ✅ Send bulk messages individually to multiple contacts
- ✅ Track delivery status (sent, delivered, read, failed)
- ✅ Campaign management and statistics
- ✅ Complete message logs for audit
- ✅ Webhook integration for real-time status updates
- ✅ Queue-based background processing
- ✅ Rate limit handling

## ⚠️ Important Notes

- Uses **Meta's Official WhatsApp Cloud API** (no browser automation)
- Messages are sent **individually**, not in groups
- Respects WhatsApp rate limits automatically
- Full audit trail of all messages
- Production-ready and Meta-compliant

---

**See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed development roadmap.**

## 🧪 Testing Checklist

Before production deployment, test:

1. ✅ **WhatsApp Connection**
   - Add WhatsApp number with access token
   - Test connection via "Test" button

2. ✅ **Template Management**
   - Create template
   - Approve template

3. ✅ **Campaign Creation**
   - Create campaign with 2-3 test contacts
   - Start campaign
   - Monitor queue jobs

4. ⏭️ **Message Sending**
   - Verify messages are sent
   - Check webhook events
   - Verify status updates

**See [QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md) for step-by-step testing guide.**
