# 📋 WhatsApp Bulk Message Sender - Development Plan

## 🎯 Project Overview
Transform the existing base project (Hotel Management) into a **WhatsApp Bulk Message Sender System** using Meta's WhatsApp Cloud API.

---

## 📊 Phase 1: Project Cleanup & Assessment

### 1.1 Codebase Analysis ✅
- [x] Review existing structure
- [x] Identify reusable components
- [x] Document current tech stack

### 1.2 Cleanup Tasks ✅ COMPLETED
- [x] **Backend Cleanup**
  - [x] Remove hotel-specific models (Branch, etc.)
  - [x] Remove hotel-specific migrations
  - [x] Clean up hotel-specific controllers
  - [x] Remove hotel-specific services (EmailService, PdfExportService - keep if needed)
  - [x] Simplify User model (remove branch_id, etc.)
  - [x] Simplify Role/Permission system (kept RBAC as requested)
  - [x] Update composer.json project name/description
  - [x] Clean up routes/api.php (remove hotel-specific routes)

- [x] **Frontend Cleanup**
  - [x] Remove hotel-specific views (branches, payments, reports, photographers)
  - [x] Remove hotel-specific services
  - [x] Clean up navigation (_nav.jsx)
  - [x] Remove hotel-specific constants/permissions
  - [x] Update package.json name/description
  - [x] Clean up routes.jsx

- [x] **Documentation Cleanup**
  - [x] Update README.md
  - [x] Update admin/README.md
  - [x] Remove/archive hotel-specific docs

### 1.3 Keep & Reuse
- ✅ Authentication system (Login, Forgot Password, Reset Password)
- ✅ User model & basic CRUD
- ✅ Settings system (for WhatsApp config)
- ✅ Dashboard structure (adapt for WhatsApp metrics)
- ✅ Laravel Queue system
- ✅ Sanctum authentication
- ✅ CoreUI React components
- ✅ API client structure
- ✅ Error handling utilities

---

## 📊 Phase 2: Database Design & Migrations

### 2.1 New Tables to Create

#### **business_profiles**
```sql
- id (bigint, primary)
- business_name (string)
- whatsapp_business_id (string, nullable)
- app_id (string, nullable)
- phone_number_id (string, nullable)
- created_at, updated_at
```

#### **whatsapp_numbers**
```sql
- id (bigint, primary)
- phone_number_id (string, unique)
- access_token (text, encrypted)
- phone_number (string)
- display_name (string, nullable)
- is_active (boolean, default: true)
- verified_at (timestamp, nullable)
- created_at, updated_at
```

#### **contacts**
```sql
- id (bigint, primary)
- name (string)
- mobile_number (string, indexed)
- email (string, nullable)
- notes (text, nullable)
- is_active (boolean, default: true)
- created_at, updated_at
- Indexes: mobile_number
```

#### **templates**
```sql
- id (bigint, primary)
- name (string, unique)
- language (string, default: 'en')
- category (string: 'MARKETING', 'UTILITY', 'AUTHENTICATION')
- body (text)
- header_type (string, nullable: 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT')
- header_content (text, nullable)
- footer (text, nullable)
- buttons (json, nullable)
- variables (json) - array of variable names
- status (enum: 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED')
- meta_template_id (string, nullable) - ID from Meta
- created_at, updated_at
- Indexes: name, status
```

#### **campaigns**
```sql
- id (bigint, primary)
- name (string, nullable) - auto-generated if not provided
- whatsapp_number_id (foreign key)
- template_id (foreign key)
- total_messages (integer)
- sent_count (integer, default: 0)
- delivered_count (integer, default: 0)
- read_count (integer, default: 0)
- failed_count (integer, default: 0)
- status (enum: 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
- started_at (timestamp, nullable)
- completed_at (timestamp, nullable)
- created_at, updated_at
- Indexes: status, created_at
```

#### **message_logs**
```sql
- id (bigint, primary)
- campaign_id (foreign key, indexed)
- contact_id (foreign key, indexed)
- whatsapp_number_id (foreign key)
- template_id (foreign key)
- wa_message_id (string, nullable, indexed) - from Meta API
- mobile_number (string, indexed)
- message_content (text) - final rendered message
- status (enum: 'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', indexed)
- error_message (text, nullable)
- sent_at (timestamp, nullable)
- delivered_at (timestamp, nullable)
- read_at (timestamp, nullable)
- failed_at (timestamp, nullable)
- retry_count (integer, default: 0)
- created_at, updated_at
- Indexes: campaign_id, contact_id, mobile_number, status, wa_message_id, created_at
```

#### **webhook_events**
```sql
- id (bigint, primary)
- event_type (string: 'message_sent', 'message_delivered', 'message_read', 'message_failed')
- wa_message_id (string, indexed)
- payload (json) - full webhook payload
- processed (boolean, default: false)
- processed_at (timestamp, nullable)
- created_at, updated_at
- Indexes: wa_message_id, processed, created_at
```

### 2.2 Migration Tasks ✅ COMPLETED
- [x] Create business_profiles migration
- [x] Create whatsapp_numbers migration
- [x] Create contacts migration
- [x] Create templates migration
- [x] Create campaigns migration
- [x] Create message_logs migration
- [x] Create webhook_events migration
- [x] Create jobs table migration (for queue)
- [x] Update users table (no branch_id found, already clean)
- [x] Create seeders for:
  - [x] Default admin user
  - [x] Sample business profile

---

## 📊 Phase 3: Backend Development

### 3.1 Models ✅ COMPLETED
- [x] **BusinessProfile** model
- [x] **WhatsAppNumber** model (with encrypted access_token)
- [x] **Contact** model
- [x] **Template** model
- [x] **Campaign** model
- [x] **MessageLog** model
- [x] **WebhookEvent** model
- [x] Update **User** model (kept as is - no hotel-specific fields found)

### 3.2 Services

#### **WhatsAppService**
- [ ] `sendMessage()` - Send single message via WhatsApp Cloud API
- [ ] `sendTemplateMessage()` - Send template message
- [ ] `verifyWebhook()` - Verify webhook signature
- [ ] `processWebhook()` - Process incoming webhook events
- [ ] `getTemplateStatus()` - Check template approval status
- [ ] `validatePhoneNumber()` - Validate phone number format

#### **ContactService**
- [ ] `importFromCSV()` - Import contacts from CSV/Excel
- [ ] `validatePhoneNumber()` - Validate and format phone numbers
- [ ] `detectDuplicates()` - Find duplicate contacts
- [ ] `bulkCreate()` - Create multiple contacts

#### **CampaignService**
- [ ] `createCampaign()` - Create campaign with message logs
- [ ] `startCampaign()` - Start sending campaign messages
- [ ] `getCampaignStats()` - Get campaign statistics
- [ ] `retryFailedMessages()` - Retry failed messages

#### **TemplateService**
- [ ] `validateTemplate()` - Validate template structure
- [ ] `renderTemplate()` - Render template with variables
- [ ] `syncWithMeta()` - Sync template status with Meta (manual)

### 3.3 Jobs (Queue)
- [ ] **SendWhatsAppMessage** job
  - [ ] Send single message
  - [ ] Handle rate limiting
  - [ ] Retry logic
  - [ ] Update message_log status
- [ ] **ProcessCampaign** job
  - [ ] Chunk messages (500-1000 per batch)
  - [ ] Dispatch SendWhatsAppMessage jobs
  - [ ] Update campaign status
- [ ] **ProcessWebhookEvent** job
  - [ ] Process webhook payload
  - [ ] Update message_log status
  - [ ] Update campaign stats

### 3.4 Controllers

#### **API Controllers**
- [ ] **BusinessProfileController**
  - [ ] GET /api/business-profile
  - [ ] PUT /api/business-profile
  
- [ ] **WhatsAppNumberController**
  - [ ] GET /api/whatsapp-numbers
  - [ ] POST /api/whatsapp-numbers
  - [ ] PUT /api/whatsapp-numbers/{id}
  - [ ] DELETE /api/whatsapp-numbers/{id}
  - [ ] POST /api/whatsapp-numbers/{id}/test-connection
  - [ ] GET /api/whatsapp-numbers/{id}/status

- [ ] **ContactController**
  - [ ] GET /api/contacts (with pagination, search, filters)
  - [ ] POST /api/contacts
  - [ ] PUT /api/contacts/{id}
  - [ ] DELETE /api/contacts/{id}
  - [ ] POST /api/contacts/import
  - [ ] GET /api/contacts/duplicates
  - [ ] POST /api/contacts/bulk-delete

- [ ] **TemplateController**
  - [ ] GET /api/templates
  - [ ] POST /api/templates
  - [ ] GET /api/templates/{id}
  - [ ] PUT /api/templates/{id}
  - [ ] DELETE /api/templates/{id}
  - [ ] POST /api/templates/{id}/preview
  - [ ] PUT /api/templates/{id}/status

- [ ] **CampaignController**
  - [ ] GET /api/campaigns
  - [ ] POST /api/campaigns
  - [ ] GET /api/campaigns/{id}
  - [ ] GET /api/campaigns/{id}/stats
  - [ ] POST /api/campaigns/{id}/start
  - [ ] POST /api/campaigns/{id}/retry-failed

- [ ] **MessageLogController**
  - [ ] GET /api/message-logs (with filters: date, status, campaign)
  - [ ] GET /api/message-logs/{id}
  - [ ] GET /api/message-logs/export
  - [ ] POST /api/message-logs/{id}/retry

- [ ] **WebhookController**
  - [ ] POST /api/webhooks/whatsapp (public route, with verification)
  - [ ] GET /api/webhooks/whatsapp (for Meta verification)

- [ ] **DashboardController** (Update existing)
  - [ ] GET /api/dashboard/summary
    - Total messages sent
    - Delivered/Failed counts
    - Connected WhatsApp number status
    - Recent campaigns

### 3.5 Middleware
- [ ] **VerifyWebhookSignature** - Verify Meta webhook signature
- [ ] Update existing middleware if needed

### 3.6 Routes
- [ ] Update routes/api.php with all new routes
- [ ] Add webhook route (public, with verification middleware)

### 3.7 Configuration ✅ COMPLETED
- [x] Add WhatsApp config file (config/whatsapp.php)
  - Rate limits
  - API endpoints
  - Webhook settings
- [x] Update .env.example with WhatsApp variables

---

## 📊 Phase 4: Frontend Development

### 4.1 Services (API Integration)
- [ ] **businessProfileService.js**
- [ ] **whatsappNumberService.js**
- [ ] **contactService.js**
- [ ] **templateService.js**
- [ ] **campaignService.js**
- [ ] **messageLogService.js**
- [ ] Update **dashboardService.js**

### 4.2 Views/Pages

#### **Dashboard** (Update existing)
- [ ] Total messages sent card
- [ ] Delivered/Failed statistics
- [ ] Connected WhatsApp number status
- [ ] Recent campaigns list
- [ ] Quick stats charts

#### **Business Profile**
- [ ] Business Profile form
  - Business Name
  - WhatsApp Business ID
  - App ID
  - Phone Number ID

#### **WhatsApp Number Setup**
- [ ] WhatsApp Numbers list
- [ ] Add/Edit WhatsApp Number form
  - Phone Number ID
  - Access Token (masked input)
  - Display Name
  - Connection status indicator
  - Test connection button

#### **Contact Management**
- [ ] Contacts list (with search, filters, pagination)
- [ ] Add Contact form
- [ ] Edit Contact form
- [ ] Import Contacts (CSV/Excel upload)
- [ ] Duplicate detection view
- [ ] Bulk actions (delete, export)

#### **Template Management**
- [ ] Templates list
- [ ] Create Template form
  - Template name
  - Language
  - Category
  - Header (type, content)
  - Body (with variable placeholders)
  - Footer
  - Buttons (CTA, Quick Reply)
  - Status (DRAFT, PENDING, APPROVED, REJECTED)
- [ ] Edit Template
- [ ] Template preview
- [ ] Template status update

#### **Message Composer**
- [ ] Select WhatsApp Number
- [ ] Select Template
- [ ] Select Contacts (multi-select, search, filters)
- [ ] Preview message with variables
- [ ] Variable mapping for each contact
- [ ] Send button (creates campaign)

#### **Campaigns**
- [ ] Campaigns list
- [ ] Campaign detail view
  - Campaign info
  - Statistics (sent, delivered, read, failed)
  - Message logs table
  - Retry failed messages button

#### **Message Logs**
- [ ] Message logs list (with filters)
  - Filter by: Date range, Status, Campaign
  - Search by: Mobile number, Contact name
- [ ] Export to CSV
- [ ] Retry individual message
- [ ] Message detail view

#### **Settings** (Update existing)
- [ ] WhatsApp API settings
- [ ] Rate limit settings
- [ ] System preferences

### 4.3 Components
- [ ] **ContactSelector** - Multi-select contact picker
- [ ] **TemplatePreview** - Template preview component
- [ ] **MessageStatusBadge** - Status badge component
- [ ] **WhatsAppConnectionStatus** - Connection status indicator
- [ ] **CampaignStatsCard** - Campaign statistics card
- [ ] **MessageLogTable** - Message logs table with filters
- [ ] **CSVImporter** - CSV/Excel import component

### 4.4 Navigation
- [ ] Update _nav.jsx with new menu items:
  - Dashboard
  - Business Profile
  - WhatsApp Numbers
  - Contacts
  - Templates
  - Compose Message
  - Campaigns
  - Message Logs
  - Settings

### 4.5 Routes
- [ ] Update routes.jsx with all new routes
- [ ] Add route guards

---

## 📊 Phase 5: WhatsApp Cloud API Integration

### 5.1 API Integration
- [ ] Setup Guzzle HTTP client for WhatsApp API
- [ ] Implement authentication (Bearer token)
- [ ] Implement rate limiting (respect Meta limits)
- [ ] Error handling for API responses
- [ ] Retry logic for failed requests

### 5.2 Webhook Implementation
- [ ] Webhook endpoint setup
- [ ] Webhook verification (GET request)
- [ ] Webhook signature verification
- [ ] Process webhook events:
  - [ ] message_sent
  - [ ] message_delivered
  - [ ] message_read
  - [ ] message_failed
- [ ] Update message_logs based on webhook events
- [ ] Update campaign statistics

### 5.3 Template Management
- [ ] Template creation format (Meta-compliant)
- [ ] Template variable handling
- [ ] Template rendering with contact data

---

## 📊 Phase 6: Queue & Background Processing

### 6.1 Queue Configuration
- [ ] Setup Laravel Queue (database driver initially)
- [ ] Configure queue workers
- [ ] Setup supervisor/systemd for queue workers (production)

### 6.2 Rate Limiting
- [ ] Implement rate limiting logic
- [ ] Respect WhatsApp API limits (1000 conversations/24h for new numbers)
- [ ] Chunk messages appropriately
- [ ] Add delays between batches

### 6.3 Retry Logic
- [ ] Retry failed messages (configurable attempts)
- [ ] Exponential backoff for retries
- [ ] Mark permanently failed after max retries

---

## 📊 Phase 7: Testing & Validation

### 7.1 Backend Testing
- [ ] Unit tests for services
- [ ] Feature tests for controllers
- [ ] Queue job tests
- [ ] Webhook processing tests

### 7.2 Frontend Testing
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests for critical flows

### 7.3 Integration Testing
- [ ] Test WhatsApp API integration (sandbox)
- [ ] Test webhook processing
- [ ] Test full campaign flow
- [ ] Test error scenarios

---

## 📊 Phase 8: Security & Compliance

### 8.1 Security
- [ ] Encrypt access tokens in database
- [ ] Webhook signature verification
- [ ] Input validation & sanitization
- [ ] CSRF protection
- [ ] SQL injection prevention
- [ ] XSS prevention

### 8.2 Compliance
- [ ] Ensure Meta WhatsApp Cloud API compliance
- [ ] No browser automation
- [ ] Proper error handling
- [ ] Audit logging

---

## 📊 Phase 9: Documentation

### 9.1 Technical Documentation
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Setup instructions
- [ ] Deployment guide

### 9.2 User Documentation
- [ ] User manual
- [ ] WhatsApp setup guide
- [ ] Template creation guide
- [ ] Campaign sending guide

---

## 📊 Phase 10: Deployment Preparation

### 10.1 Environment Setup
- [ ] Production .env configuration
- [ ] Queue worker configuration
- [ ] Webhook URL setup
- [ ] SSL certificate (for webhooks)

### 10.2 Performance Optimization
- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching strategy
- [ ] Asset optimization

### 10.3 Monitoring
- [ ] Error logging
- [ ] Queue monitoring
- [ ] API rate limit monitoring
- [ ] Webhook delivery monitoring

---

## 🎯 Development Priority Order

### **Sprint 1: Foundation (Week 1)**
1. Project cleanup
2. Database design & migrations
3. Basic models

### **Sprint 2: Core Backend (Week 2)**
1. WhatsAppService
2. ContactService
3. Basic controllers (Business Profile, WhatsApp Numbers, Contacts)

### **Sprint 3: Template & Campaign (Week 3)**
1. TemplateService & TemplateController
2. CampaignService & CampaignController
3. MessageLog model & controller

### **Sprint 4: Queue & Sending (Week 4)**
1. Queue jobs
2. WhatsApp API integration
3. Message sending flow

### **Sprint 5: Webhooks (Week 5)**
1. Webhook endpoint
2. Webhook processing
3. Status updates

### **Sprint 6: Frontend - Core (Week 6)**
1. Dashboard
2. Business Profile
3. WhatsApp Numbers
4. Contacts

### **Sprint 7: Frontend - Templates & Campaigns (Week 7)**
1. Template management
2. Message composer
3. Campaigns view

### **Sprint 8: Frontend - Logs & Polish (Week 8)**
1. Message logs
2. Settings
3. UI/UX polish
4. Testing

---

## 📝 Notes

- **Single User System**: Simplify authentication, remove complex RBAC
- **Rate Limits**: Respect WhatsApp Cloud API limits strictly
- **Webhooks are Critical**: Must work correctly for accurate status
- **Queue is Mandatory**: Never send directly from controller
- **Logging is Essential**: Store all messages for audit
- **Meta Compliance**: Only use official WhatsApp Cloud API

---

## ✅ Success Criteria Checklist

- [ ] Client can connect WhatsApp Business number
- [ ] Client can import/manage contacts
- [ ] Client can create templates
- [ ] Client can send bulk messages
- [ ] Delivery status updates automatically via webhooks
- [ ] System handles rate limits properly
- [ ] Failed messages can be retried
- [ ] Full message logs available
- [ ] Zero WhatsApp ban risk
- [ ] System runs unattended

---

**Last Updated**: 2025-01-20  
**Status**: Phase 1 & 2 Complete ✅  
**Next Step**: Phase 4 - Frontend Development

## 📊 Progress Summary

### ✅ Completed Phases
- **Phase 1**: Project Cleanup & Assessment ✅
- **Phase 2**: Database Design & Migrations ✅
- **Phase 3.1**: Models ✅

### 🚧 Current Phase
- **Phase 4**: Frontend Development (Starting)

### ⏭️ Remaining Phases
- Phase 3.2-3.7: Backend Services, Controllers, Routes
- Phase 5: WhatsApp Cloud API Integration
- Phase 6: Queue & Background Processing
- Phase 7: Testing & Validation
- Phase 8: Security & Compliance
- Phase 9: Documentation
- Phase 10: Deployment Preparation

