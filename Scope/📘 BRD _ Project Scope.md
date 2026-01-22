# **📘 BRD / Project Scope**

## **WhatsApp Bulk Message Sender System**

*(Single Customer – Using WhatsApp Cloud API)*

---

## **1\. Project Overview**

### **Project Purpose**

Develop a **custom internal web application** for the client to send **WhatsApp messages to multiple customers individually in one shot** using **Meta’s Official WhatsApp Cloud API**.

The system must be:

* Legal  
* Stable  
* Scalable  
* Simple for non-technical users

---

## **2\. In-Scope (What We WILL Build)**

### **Core Capabilities**

* Connect official WhatsApp Business number  
* Upload/manage customer contacts  
* Create & use approved WhatsApp templates  
* Send bulk messages **individually**  
* Track delivery status (sent / delivered / read / failed)  
* Maintain full message logs for audit

---

## **3\. Out of Scope (What We WILL NOT Build)**

* ❌ No SaaS / multi-client system  
* ❌ No billing / subscription  
* ❌ No unofficial WhatsApp automation  
* ❌ No chatbot / auto-replies (future scope)  
* ❌ No marketing analytics dashboards

---

## **4\. User Type**

### **Single Internal User**

* Client business staff  
* Full access to system  
* No role-based complexity

---

## **5\. Technology Stack**

| Layer | Technology |
| ----- | ----- |
| Backend | PHP (Laravel preferred) |
| Frontend | Blade \+ Bootstrap / Admin UI |
| Database | MySQL |
| WhatsApp API | **Meta WhatsApp Cloud API** |
| Background Jobs | Laravel Queue (DB / Redis later) |
| Hosting | Linux VPS |
| Future | .NET Core migration possible |

---

## **6\. Functional Modules & Pages (Final)**

### **6.1 Authentication**

* Login  
* Forgot Password  
* Reset Password  
* Logout

---

### **6.2 Dashboard**

* Total messages sent  
* Delivered / Failed count  
* Connected WhatsApp number status

---

### **6.3 Business Profile**

* Business Name  
* WhatsApp Business ID  
* App ID (Meta)  
* Phone Number ID

---

### **6.4 WhatsApp Number Setup**

* Configure WhatsApp Cloud API credentials  
* Store:  
  * Phone Number ID  
  * Access Token  
* Show connection status

📌 **Note:**  
Verification & payment handled in **Meta Business Manager**, not inside app.

---

### **6.5 Contact Management**

* Contacts list  
* Add single contact  
* Import Excel / CSV  
* Duplicate number detection  
* Invalid number reporting

---

### **6.6 Template Management**

* Create template (as per Meta format)  
* Store template name, language, variables  
* Template approval handled in Meta portal  
* Manual status update option (Approved / Rejected)

---

### **6.7 Message Composer**

* Select WhatsApp number  
* Select template  
* Select contacts  
* Preview message with variables  
* Send message

📌 Messages are sent **individually**, not group-based.

---

### **6.8 Campaigns (Simple Grouping)**

* Auto-created on every send action  
* Shows:  
  * Total messages  
  * Delivered %  
  * Failed %

📌 Campaign \= **one send operation**

---

### **6.9 Message Logs & Status**

* One DB row \= one message to one contact  
* Status types:  
  * PENDING  
  * SENT  
  * DELIVERED  
  * READ  
  * FAILED  
* Filter by:  
  * Date  
  * Status  
  * Campaign  
* Export CSV

---

### **6.10 Queue & Background Processing**

* Chunk messages (e.g. 500–1000)  
* Send via background queue  
* Retry failed messages  
* Respect WhatsApp rate limits

---

### **6.11 Webhooks (Critical)**

* Receive webhook events from Meta:  
  * message\_sent  
  * message\_delivered  
  * message\_read  
  * message\_failed  
* Update message\_logs table using `wa_message_id`

---

### **6.12 Settings**

* API token management  
* Rate limit settings  
* System preferences

---

## **7\. High-Level Technical Flow**

1. User clicks **Send**  
2. System creates:  
   * Campaign record  
   * Message log rows (status \= PENDING)  
3. Queue starts sending messages  
4. WhatsApp Cloud API returns `message_id`  
5. Webhook updates real delivery status  
6. Dashboard & logs update automatically

---

## **8\. Database Design Principles**

* Message logs WILL grow (expected & normal)  
* Indexing is mandatory:  
  * campaign\_id  
  * mobile\_number  
  * status  
  * created\_at  
  * wa\_message\_id  
* Pagination used everywhere  
* No full table scans

---

## **9\. Security & Compliance Notes**

* Only official WhatsApp Cloud API  
* No browser automation  
* No session hijacking  
* Access tokens stored securely  
* Webhook verification enabled  
* Message logs preserved for audit

---

## **10\. Performance Expectations**

| Item | Expected |
| ----- | ----- |
| Daily Messages | 1k – 10k |
| Monthly Logs | \~100k |
| Yearly Logs | \~1–2 million |
| DB Handling | Fully manageable |

---

## **11\. Important Development Notes (READ CAREFULLY)**

⚠️ **Do NOT**

* Send messages directly from controller  
* Trust API response as final delivery  
* Skip logging to reduce DB size

✅ **Must**

* Use queues for sending  
* Use webhooks for status  
* Store every message  
* Handle retries gracefully

---

## **12\. Success Criteria**

* Client can send bulk WhatsApp messages without help  
* Zero WhatsApp ban risk  
* Accurate delivery status  
* System runs unattended

---

## **✅ FINAL CONFIRMATION**

This scope is:

* **Production-ready**  
* **Meta-compliant**  
* **Client-safe**  
* **Cursor AI friendly**  
* **Future .NET Core compatible**

