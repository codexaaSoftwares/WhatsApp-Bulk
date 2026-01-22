# 🚀 Quick Start Checklist - WhatsApp Bulk Message Sender

## Immediate Next Steps (Start Here)

### ✅ Step 1: Project Cleanup (Day 1-2)

#### Backend Cleanup
```bash
cd backend
```

**Remove Hotel-Specific Files:**
- [ ] Delete `app/Models/Branch.php`
- [ ] Delete `app/Http/Controllers/API/BranchController.php`
- [ ] Delete `database/migrations/2025_11_17_083142_create_branches_table.php`
- [ ] Remove branch-related routes from `routes/api.php`
- [ ] Remove branch_id from users table (if exists)

**Update Project Info:**
- [ ] Update `composer.json`:
  - name: "whatsapp-bulk/backend"
  - description: "WhatsApp Bulk Message Sender Backend API"

**Clean Services:**
- [ ] Review `app/Services/EmailService.php` - keep if needed for notifications
- [ ] Review `app/Services/PdfExportService.php` - remove if not needed

#### Frontend Cleanup
```bash
cd admin
```

**Remove Hotel-Specific Views:**
- [ ] Delete `src/views/branches/`
- [ ] Delete `src/views/payments/`
- [ ] Delete `src/views/reports/` (or keep structure for message logs)
- [ ] Delete `src/services/branchService.js`
- [ ] Delete `src/services/paymentService.js`
- [ ] Delete `src/services/reportService.js` (or repurpose)

**Update Project Info:**
- [ ] Update `package.json`:
  - name: "whatsapp-bulk-admin"
  - description: "WhatsApp Bulk Message Sender Admin Panel"

**Clean Navigation:**
- [ ] Update `src/_nav.jsx` - remove hotel-specific menu items

#### Documentation
- [ ] Update root `README.md`
- [ ] Update `admin/README.md`

---

### ✅ Step 2: Database Setup (Day 2-3)

**Create Migrations:**
```bash
cd backend
php artisan make:migration create_business_profiles_table
php artisan make:migration create_whatsapp_numbers_table
php artisan make:migration create_contacts_table
php artisan make:migration create_templates_table
php artisan make:migration create_campaigns_table
php artisan make:migration create_message_logs_table
php artisan make:migration create_webhook_events_table
```

**Run Migrations:**
```bash
php artisan migrate
```

**Create Seeders:**
```bash
php artisan make:seeder BusinessProfileSeeder
php artisan make:seeder AdminUserSeeder
```

---

### ✅ Step 3: Backend Models (Day 3-4)

**Create Models:**
```bash
php artisan make:model BusinessProfile
php artisan make:model WhatsAppNumber
php artisan make:model Contact
php artisan make:model Template
php artisan make:model Campaign
php artisan make:model MessageLog
php artisan make:model WebhookEvent
```

**Implement:**
- [ ] Relationships
- [ ] Fillable/guarded
- [ ] Casts (JSON, dates, etc.)
- [ ] Accessors/Mutators (for encrypted tokens)

---

### ✅ Step 4: WhatsApp Service (Day 4-5)

**Create Service:**
```bash
php artisan make:service WhatsAppService
```

**Implement Methods:**
- [ ] `sendTemplateMessage()`
- [ ] `verifyWebhook()`
- [ ] `processWebhook()`
- [ ] `validatePhoneNumber()`

**Install Guzzle (if not already):**
```bash
composer require guzzlehttp/guzzle
```

---

### ✅ Step 5: Queue Jobs (Day 5-6)

**Create Jobs:**
```bash
php artisan make:job SendWhatsAppMessage
php artisan make:job ProcessCampaign
php artisan make:job ProcessWebhookEvent
```

**Configure Queue:**
- [ ] Update `.env` with `QUEUE_CONNECTION=database`
- [ ] Run `php artisan queue:table`
- [ ] Run `php artisan migrate`

---

### ✅ Step 6: Controllers (Day 6-7)

**Create Controllers:**
```bash
php artisan make:controller API/BusinessProfileController
php artisan make:controller API/WhatsAppNumberController
php artisan make:controller API/ContactController
php artisan make:controller API/TemplateController
php artisan make:controller API/CampaignController
php artisan make:controller API/MessageLogController
php artisan make:controller API/WebhookController
```

**Update DashboardController:**
- [ ] Modify `summary()` method for WhatsApp metrics

---

### ✅ Step 7: Frontend Services (Day 7-8)

**Create Services:**
```bash
cd admin/src/services
```

- [ ] `businessProfileService.js`
- [ ] `whatsappNumberService.js`
- [ ] `contactService.js`
- [ ] `templateService.js`
- [ ] `campaignService.js`
- [ ] `messageLogService.js`

---

### ✅ Step 8: Frontend Views (Day 8-12)

**Create Views:**
- [ ] Dashboard (update existing)
- [ ] Business Profile
- [ ] WhatsApp Numbers
- [ ] Contacts
- [ ] Templates
- [ ] Message Composer
- [ ] Campaigns
- [ ] Message Logs

---

### ✅ Step 9: Webhook Setup (Day 12-13)

**Configure:**
- [ ] Webhook endpoint: `/api/webhooks/whatsapp`
- [ ] Webhook verification
- [ ] Webhook processing
- [ ] Test webhook locally (ngrok)

---

### ✅ Step 10: Testing & Polish (Day 13-14)

- [ ] Test full flow
- [ ] Fix bugs
- [ ] UI/UX improvements
- [ ] Documentation

---

## 🔧 Environment Variables Needed

### Backend (.env)
```env
# WhatsApp Cloud API
WHATSAPP_API_BASE_URL=https://graph.facebook.com/v18.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token_here
WHATSAPP_APP_SECRET=your_app_secret_here

# Queue
QUEUE_CONNECTION=database

# Encryption (for access tokens)
APP_KEY=your_app_key_here
```

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=WhatsApp Bulk Sender
```

---

## 📦 Required Packages

### Backend
- ✅ Laravel 9 (existing)
- ✅ Laravel Sanctum (existing)
- ✅ Guzzle HTTP (existing)
- [ ] Laravel Queue (database driver)

### Frontend
- ✅ React 19 (existing)
- ✅ CoreUI React (existing)
- ✅ Axios (existing)
- [ ] React CSV (for export) - optional
- [ ] React Dropzone (for CSV import) - optional

---

## 🎯 Critical Path Items

These must be done in order:

1. **Cleanup** → Remove hotel-specific code
2. **Database** → Create all tables
3. **Models** → Define relationships
4. **WhatsAppService** → Core API integration
5. **Queue Jobs** → Background processing
6. **Controllers** → API endpoints
7. **Webhooks** → Status updates
8. **Frontend** → User interface

---

## ⚠️ Important Notes

- **Never send messages directly from controller** - Always use queue
- **Always verify webhook signatures** - Security critical
- **Respect rate limits** - WhatsApp will ban if exceeded
- **Log everything** - Required for audit
- **Test with Meta sandbox first** - Before production

---

## 🚨 Common Pitfalls to Avoid

1. ❌ Sending messages synchronously
2. ❌ Not verifying webhook signatures
3. ❌ Ignoring rate limits
4. ❌ Not handling webhook failures
5. ❌ Missing database indexes
6. ❌ Not encrypting access tokens
7. ❌ Trusting API response as final status (use webhooks)

---

**Status**: Ready to Start  
**Estimated Timeline**: 2-3 weeks for MVP  
**Next Action**: Begin Step 1 - Project Cleanup

