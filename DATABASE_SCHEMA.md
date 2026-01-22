# 📊 Database Schema - WhatsApp Bulk Message Sender

## Entity Relationship Diagram

```
┌─────────────────┐
│  business_profiles │
│─────────────────│
│ id (PK)         │
│ business_name   │
│ whatsapp_biz_id │
│ app_id          │
│ phone_number_id │
└─────────────────┘
         │
         │
┌─────────────────┐
│ whatsapp_numbers │
│─────────────────│
│ id (PK)         │◄──┐
│ phone_number_id │   │
│ access_token    │   │
│ phone_number    │   │
│ display_name    │   │
│ is_active       │   │
└─────────────────┘   │
         │             │
         │             │
         │             │
┌─────────────────┐   │
│   campaigns     │   │
│─────────────────│   │
│ id (PK)         │   │
│ whatsapp_num_id │───┘
│ template_id     │───┐
│ total_messages  │   │
│ sent_count      │   │
│ delivered_count │   │
│ read_count      │   │
│ failed_count    │   │
│ status          │   │
└─────────────────┘   │
         │             │
         │             │
         │             │
┌─────────────────┐   │
│  message_logs   │   │
│─────────────────│   │
│ id (PK)         │   │
│ campaign_id     │───┘
│ contact_id      │───┐
│ whatsapp_num_id │───┤
│ template_id     │───┼───┐
│ wa_message_id   │   │   │
│ mobile_number   │   │   │
│ message_content │   │   │
│ status          │   │   │
│ sent_at         │   │   │
│ delivered_at    │   │   │
│ read_at         │   │   │
└─────────────────┘   │   │
         │             │   │
         │             │   │
┌─────────────────┐   │   │
│    contacts     │   │   │
│─────────────────│   │   │
│ id (PK)         │───┘   │
│ name            │       │
│ mobile_number   │       │
│ email           │       │
│ is_active       │       │
└─────────────────┘       │
                          │
┌─────────────────┐       │
│   templates     │       │
│─────────────────│       │
│ id (PK)         │───────┘
│ name            │
│ language        │
│ category        │
│ body            │
│ header_type     │
│ header_content  │
│ footer          │
│ variables (JSON)│
│ status          │
│ meta_template_id│
└─────────────────┘

┌─────────────────┐
│ webhook_events  │
│─────────────────│
│ id (PK)         │
│ event_type      │
│ wa_message_id   │
│ payload (JSON)  │
│ processed       │
└─────────────────┘
```

---

## Table Definitions

### 1. business_profiles

Stores business profile information.

```sql
CREATE TABLE business_profiles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    business_name VARCHAR(255) NOT NULL,
    whatsapp_business_id VARCHAR(255) NULL,
    app_id VARCHAR(255) NULL,
    phone_number_id VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Relationships:**
- One-to-one with system (single business profile)

**Indexes:**
- Primary key on `id`

---

### 2. whatsapp_numbers

Stores WhatsApp number configurations and access tokens.

```sql
CREATE TABLE whatsapp_numbers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    phone_number_id VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL, -- Encrypted
    phone_number VARCHAR(20) NOT NULL,
    display_name VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Relationships:**
- One-to-many with `campaigns`
- One-to-many with `message_logs`

**Indexes:**
- Primary key on `id`
- Unique index on `phone_number_id`
- Index on `is_active`

**Security:**
- `access_token` must be encrypted using Laravel's encryption

---

### 3. contacts

Stores customer contact information.

```sql
CREATE TABLE contacts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NULL,
    notes TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Relationships:**
- One-to-many with `message_logs`

**Indexes:**
- Primary key on `id`
- Index on `mobile_number` (for fast lookups)
- Index on `is_active`
- Unique index on `mobile_number` (optional, if no duplicates allowed)

**Validation:**
- `mobile_number` must be in E.164 format (e.g., +1234567890)

---

### 4. templates

Stores WhatsApp message templates.

```sql
CREATE TABLE templates (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    category ENUM('MARKETING', 'UTILITY', 'AUTHENTICATION') NOT NULL,
    body TEXT NOT NULL,
    header_type ENUM('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT') NULL,
    header_content TEXT NULL,
    footer TEXT NULL,
    buttons JSON NULL,
    variables JSON NOT NULL, -- Array of variable names
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
    meta_template_id VARCHAR(255) NULL, -- ID from Meta
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Relationships:**
- One-to-many with `campaigns`
- One-to-many with `message_logs`

**Indexes:**
- Primary key on `id`
- Unique index on `name`
- Index on `status`
- Index on `category`

**JSON Fields:**
- `variables`: `["name", "order_id", "date"]`
- `buttons`: 
  ```json
  [
    {"type": "URL", "text": "Visit", "url": "https://example.com"},
    {"type": "QUICK_REPLY", "text": "Yes"}
  ]
  ```

---

### 5. campaigns

Stores campaign information (one send operation).

```sql
CREATE TABLE campaigns (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NULL, -- Auto-generated if not provided
    whatsapp_number_id BIGINT UNSIGNED NOT NULL,
    template_id BIGINT UNSIGNED NOT NULL,
    total_messages INT UNSIGNED NOT NULL DEFAULT 0,
    sent_count INT UNSIGNED DEFAULT 0,
    delivered_count INT UNSIGNED DEFAULT 0,
    read_count INT UNSIGNED DEFAULT 0,
    failed_count INT UNSIGNED DEFAULT 0,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (whatsapp_number_id) REFERENCES whatsapp_numbers(id) ON DELETE RESTRICT,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT
);
```

**Relationships:**
- Many-to-one with `whatsapp_numbers`
- Many-to-one with `templates`
- One-to-many with `message_logs`

**Indexes:**
- Primary key on `id`
- Index on `whatsapp_number_id`
- Index on `template_id`
- Index on `status`
- Index on `created_at` (for date filtering)

**Auto-calculation:**
- `total_messages` = count of message_logs for this campaign
- Statistics updated via webhooks and job processing

---

### 6. message_logs

Stores individual message records (one row = one message to one contact).

```sql
CREATE TABLE message_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    campaign_id BIGINT UNSIGNED NOT NULL,
    contact_id BIGINT UNSIGNED NOT NULL,
    whatsapp_number_id BIGINT UNSIGNED NOT NULL,
    template_id BIGINT UNSIGNED NOT NULL,
    wa_message_id VARCHAR(255) NULL, -- From Meta API
    mobile_number VARCHAR(20) NOT NULL, -- Denormalized for performance
    message_content TEXT NOT NULL, -- Final rendered message
    status ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED') DEFAULT 'PENDING',
    error_message TEXT NULL,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    retry_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    FOREIGN KEY (whatsapp_number_id) REFERENCES whatsapp_numbers(id) ON DELETE RESTRICT,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT
);
```

**Relationships:**
- Many-to-one with `campaigns`
- Many-to-one with `contacts`
- Many-to-one with `whatsapp_numbers`
- Many-to-one with `templates`

**Indexes:**
- Primary key on `id`
- Index on `campaign_id` (critical for campaign queries)
- Index on `contact_id`
- Index on `whatsapp_number_id`
- Index on `template_id`
- Index on `mobile_number` (for search)
- Index on `status` (for filtering)
- Index on `wa_message_id` (for webhook lookups)
- Index on `created_at` (for date filtering)
- Composite index on `(campaign_id, status)` (for campaign stats)

**Performance Notes:**
- This table will grow large (millions of rows)
- All indexes are critical for performance
- Consider partitioning by date in the future if needed

---

### 7. webhook_events

Stores incoming webhook events from Meta.

```sql
CREATE TABLE webhook_events (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL, -- 'message_sent', 'message_delivered', etc.
    wa_message_id VARCHAR(255) NOT NULL,
    payload JSON NOT NULL, -- Full webhook payload
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Relationships:**
- None (standalone table for audit)

**Indexes:**
- Primary key on `id`
- Index on `wa_message_id` (for lookups)
- Index on `processed` (for processing queue)
- Index on `created_at` (for date filtering)

**Purpose:**
- Audit trail of all webhook events
- Retry processing if needed
- Debugging webhook issues

---

## Indexing Strategy

### Critical Indexes (Must Have)

1. **message_logs**
   - `campaign_id` - For campaign statistics
   - `status` - For filtering by status
   - `wa_message_id` - For webhook lookups
   - `mobile_number` - For search
   - `created_at` - For date range queries
   - Composite: `(campaign_id, status)` - For campaign stats

2. **campaigns**
   - `status` - For filtering active campaigns
   - `created_at` - For date filtering

3. **contacts**
   - `mobile_number` - For duplicate detection and lookups

4. **templates**
   - `status` - For filtering approved templates

### Performance Considerations

- **message_logs** will be the largest table
- Use pagination everywhere
- Avoid full table scans
- Consider archiving old logs (after 1-2 years)

---

## Data Volume Estimates

Based on BRD requirements:

| Table | Daily | Monthly | Yearly |
|-------|-------|---------|--------|
| message_logs | 1k-10k | ~100k | ~1-2M |
| campaigns | 1-10 | ~30-300 | ~365-3,650 |
| contacts | 10-100 | ~300-3k | ~3.6k-36k |
| templates | 1-5 | ~5-20 | ~20-100 |
| webhook_events | 1k-10k | ~100k | ~1-2M |

**Database Size Estimate:**
- Year 1: ~500MB - 2GB
- Year 2: ~1GB - 4GB
- Year 3: ~2GB - 8GB

---

## Migration Order

1. `business_profiles`
2. `whatsapp_numbers`
3. `contacts`
4. `templates`
5. `campaigns`
6. `message_logs`
7. `webhook_events`

**Reason:** Foreign key dependencies require this order.

---

## Sample Data

See seeders for sample data examples.

---

**Last Updated**: 2025-01-XX  
**Status**: Design Complete

