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
php artisan serve
```

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
- **[Scope/📘 BRD _ Project Scope.md](./Scope/📘%20BRD%20_%20Project%20Scope.md)** - Business Requirements Document

## 🔧 Environment Setup

1. Copy `admin/env.example` to `admin/.env.local`
2. Copy `backend/env.example` to `backend/.env`
3. Update database credentials and API URLs
4. Run migrations and seeders

## 📝 Development

- Frontend: `cd admin && npm run dev`
- Backend: `cd backend && php artisan serve`

---

## 🎯 Project Status

**Current Phase**: Planning & Cleanup  
**Status**: In Development  
**Version**: 1.0.0

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
