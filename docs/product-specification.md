# Product Specification Document

## SIBARKUMEN - Sistem Informasi Barang dan Dokumen

**Version:** 1.0
**Date:** January 23, 2026
**Status:** Production

---

## 1. Executive Summary

SIBARKUMEN is a comprehensive inventory management and document tracking system designed for government organizations to manage goods procurement, distribution, and documentation processes. The system provides end-to-end workflow management from procurement requests (SPB) to final delivery documentation (BAST).

### 1.1 Key Objectives

- Digitalize inventory management processes
- Automate document numbering and tracking
- Implement role-based access control (RBAC)
- Provide real-time inventory visibility
- Generate accurate reports and archives
- Ensure data integrity and audit trails

### 1.2 Scope

The system covers the complete lifecycle of inventory management including:

- Procurement request processing
- Approval workflows
- Goods receipt and delivery
- Stock management and opname
- Document archival and reporting

---

## 2. User Roles and Permissions

### 2.1 Role Hierarchy

#### Admin

**Full Access** - Complete system control

- All CRUD operations across all modules
- User management
- Master data configuration
- System settings

#### Supervisor

**Read + Limited Write** - Oversight and approval

- **Can:**
  - View all data and documents
  - Approve/reject SPB requests
  - Generate reports
  - Print documents
- **Cannot:**
  - Create/edit/delete inventory items (Barang)
  - Create/edit/delete BAST Masuk/Keluar
  - Create Stock Opname sessions
  - Manage master data

#### Petugas (Officer)

**Operational Access** - Day-to-day operations

- Create and manage SPB (procurement requests)
- View assigned SPPB
- Limited access based on data ownership
- Must be linked to Pegawai (employee) record

### 2.2 Authentication

- Email/password authentication via Better Auth
- Role-based authorization
- Session management with IP and user agent tracking
- Account ban capability with expiration

---

## 3. Core Features

### 3.1 Dashboard

**Purpose:** Centralized analytics and quick access

**Features:**

- Statistical overview cards
  - Total items
  - Low stock alerts
  - Transaction summaries
- Category distribution visualization (charts)
- Fast-moving items list
- Dead stock monitoring
- Recent activity feed

**Access:** Admin, Supervisor

---

### 3.2 Inventory Management (Barang)

#### 3.2.1 Item Master Data

**Purpose:** Central repository for all inventory items

**Data Model:**

- Item Code (auto-generated: `{CategoryPrefix}.{SeqNumber}`)
- Item Name (unique)
- Category
- Unit of Measurement (UOM)
- Current Stock Level
- Specification (optional)
- Status tracking (timestamps)

**Features:**

- Search and filter (by category, status, name)
- Sortable columns
- Bulk operations
- Stock level indicators (low stock warnings)
- Column visibility controls

**Business Rules:**

- Item names must be unique
- Item codes auto-generated based on category
- Stock cannot be manually adjusted (only through transactions)
- Deletion restricted if item has transaction history

**Access Control:**

- Admin: Full CRUD
- Supervisor: Read only
- Petugas: Read only

---

### 3.3 Stock Opname (Physical Inventory Count)

**Purpose:** Periodic physical inventory verification and adjustment

#### 3.3.1 Workflow

1. **Session Creation** (Admin only)
   - Generate unique Stock Opname number (`SO/YYYY/MM/XXXX`)
   - Assign responsible officer (Petugas)
   - Snapshot current system stock for all items

2. **Counting Phase** (Draft status)
   - Record physical count (`stokFisik`) per item
   - Calculate variance (`selisih = stokFisik - stokSistem`)
   - Add notes/reasons for discrepancies

3. **Finalization** (Admin only)
   - Review variances
   - Finalize session → generates adjustment transactions
   - Creates mutation records (PENYESUAIAN)
   - Updates actual stock levels
   - Status changes to COMPLETED

**Data Model:**

```
StockOpname (Header)
├── Session Number
├── Date
├── Status (DRAFT/COMPLETED)
├── Officer Assignment
└── Details (per item)
    ├── System Stock
    ├── Physical Stock
    ├── Variance
    └── Notes
```

**Access Control:**

- Admin: Full access
- Supervisor: Cannot create or finalize
- Petugas: View assigned sessions only

---

### 3.4 SPB (Surat Permintaan Barang - Procurement Request)

**Purpose:** Employee procurement request initiation

#### 3.4.1 Document Structure

**Header:**

- SPB Number (auto: `{SeqNo}/-077/SPB/{Year}`)
- Request Date
- Requester (Pemohon)
- Status tracking

**Line Items:**

- Item selection
- Quantity requested
- Purpose/Justification

#### 3.4.2 Workflow States

1. **Draft** - Being prepared
2. **Pending Approval** - Submitted, awaiting review
3. **Approved** - Admin/Supervisor approved
4. **Rejected** - Denied with reason
5. **Completed** - SPPB generated

#### 3.4.3 Business Rules

- Petugas can only create SPB if linked to employee record
- Alert shown if no employee linkage
- One requester per SPB
- Minimum 1 line item required
- Cannot modify after approval

**Access Control:**

- Admin: Full CRUD
- Supervisor: Read, Approve/Reject
- Petugas: Create own requests, view own

---

### 3.5 SPPB (Surat Persetujuan Permintaan Barang - Approval Letter)

**Purpose:** Formal approval document for procurement

#### 3.5.1 Generation

- Created from approved SPB
- Number format: `{SeqNo}/-077/SPPB/{Year}`
- Inherits SPB line items
- Assigns approval authority (PPTK/PPK)

#### 3.5.2 Status Flow

1. **Pending** - Awaiting external processing
2. **Menunggu BAST** - Ready for delivery
3. **Selesai** - Delivery completed (BAST created)

**Access Control:**

- Admin: Full access
- Supervisor: Read, approve
- Petugas: View related to own SPB

---

### 3.6 BAST Masuk (Incoming Goods Receipt)

**Purpose:** Formalize goods receipt and update inventory

#### 3.6.1 Document Components

**Header:**

- Reference Number (auto-generated: `00722::BA1.{SeqNo}`)
- BAST Number (manual entry)
- BAST Date
- BAPB Number & Date
- Supplier (Pihak Ketiga)
- Procurement Source (Asal Pembelian)
- Receiving Official (PPTK/PPK)
- Bank Account
- Purpose (Peruntukkan)

**Line Items:**

- Item
- Quantity received
- Unit price
- Notes

#### 3.6.2 Inventory Impact

Upon creation:

- Increase stock levels
- Create mutation records (MASUK)
- Record financial values
- Generate audit trail

#### 3.6.3 Edit Functionality

- Reverses original stock impact
- Applies new quantities
- Maintains mutation history
- Validates sufficient stock for reversal

**Business Rules:**

- Cannot delete if stock already distributed
- Stock reversal check on edit/delete
- Unique BAST and BAPB numbers
- All financial data tracked

**Access Control:**

- Admin: Full CRUD
- Supervisor: Read only, cannot create/edit/delete
- Petugas: No access

---

### 3.7 BAST Keluar (Outgoing Goods Delivery)

**Purpose:** Formalize goods delivery to recipients

#### 3.7.1 Creation Flow

- Created from SPPB (Menunggu BAST status)
- Number format: `{SeqNo}/-077/BAST/{Year}`
- Links to original SPPB request

**Document Structure:**

- Delivery number and date
- First Party (Pihak Pertama)
- Second Party (Pihak Kedua)
- Line items with quantities
- Financial calculations:
  - Unit prices
  - VAT (PPN) percentages
  - Subtotals
  - Grand total

#### 3.7.2 Inventory Impact

- Decreases stock levels
- Creates mutation records (KELUAR)
- Validates sufficient stock before creation
- Updates SPPB status to SELESAI

#### 3.7.3 Print Status Tracking

- Print status flag (isPrinted)
- Toggle capability for print tracking
- Used for document control

**Business Rules:**

- Must reference valid SPPB
- Stock availability validation
- Cannot create if insufficient stock
- Deletion reverts SPPB to Menunggu BAST
- One BAST Keluar per SPPB

**Access Control:**

- Admin: Full CRUD + print status
- Supervisor: Read + print, cannot create/edit/delete/toggle status
- Petugas: No access

---

### 3.8 Mutation Records (Mutasi Barang)

**Purpose:** Complete audit trail of all stock movements

#### 3.8.1 Types

- **MASUK** - Stock increase (BAST Masuk)
- **KELUAR** - Stock decrease (BAST Keluar)
- **PENYESUAIAN** - Adjustments (Stock Opname, corrections)

#### 3.8.2 Data Model

- Transaction date
- Item reference
- Mutation type
- Quantity in
- Quantity out
- Ending balance (stokAkhir)
- Reference document ID
- Source transaction type
- Description

#### 3.8.3 Features

- Complete history per item
- Searchable by item
- Chronological sorting
- Reference document linking
- Read-only (system-generated)

**Access:** All roles (read-only)

---

### 3.9 Master Data Management

#### 3.9.1 Categories (Kategori)

- Name
- Prefix code (for item numbering)
- CRUD operations

#### 3.9.2 Units (Satuan)

- Unit name (e.g., pcs, kg, liter)
- Standard units library
- CRUD operations

#### 3.9.3 Employees (Pegawai)

- Name
- NIP (Employee ID)
- Phone
- Address
- Position (Jabatan) linkage
- User account linkage
- CRUD operations

#### 3.9.4 Positions (Jabatan)

- Position name
- CRUD operations
- Used for organizational hierarchy

#### 3.9.5 Third Parties (Pihak Ketiga)

- Suppliers/vendors/partners
- Name, contact, address
- CRUD operations

#### 3.9.6 Procurement Sources (Asal Pembelian)

- Purchase source types
- Name management

#### 3.9.7 Bank Accounts (Rekening)

- Account holder
- Bank name
- Account number
- Used for payment tracking

**Access Control:** Admin only

---

### 3.10 Reports and Archives

#### 3.10.1 Document Archive (Arsip)

- Centralized document repository
- All SPB, SPPB, BAST stored
- Search across all document types
- Filter by date range, type, status
- Quick access to original documents

#### 3.10.2 Price History (Riwayat Harga)

- Item price tracking over time
- Historical pricing from BAST Masuk
- Supplier comparison
- Trend analysis

**Access:** Admin, Supervisor (read), Petugas (limited)

---

### 3.11 User Management

**Purpose:** System user administration (Admin only)

**Features:**

- Create user accounts
- Assign roles (admin/supervisor/petugas)
- Link to employee records
- Ban/unban users
- Set ban expiration
- View user activity

**User Linking:**

- Petugas users should be linked to Pegawai records
- Enables proper requester tracking
- Required for SPB creation

---

## 4. Document Numbering System

### 4.1 Current Formats

| Document     | Format                       | Example             |
| ------------ | ---------------------------- | ------------------- |
| SPB          | `{Number}/-077/SPB/{Year}`   | `1/-077/SPB/2026`   |
| SPPB         | `{Number}/-077/SPPB/{Year}`  | `29/-077/SPPB/2026` |
| BAST Keluar  | `{Number}/-077/BAST/{Year}`  | `15/-077/BAST/2026` |
| BAST Masuk   | `00722::BA1.{Number}`        | `00722::BA1.00001`  |
| Stock Opname | `SO/{Year}/{Month}/{Number}` | `SO/2026/01/0001`   |

### 4.2 Generation Rules

- Sequential numbering (no padding for new formats)
- Year-based reset for SPB/SPPB/BAST Keluar
- Unique constraint enforcement
- Retry logic for concurrent creation
- Database-driven sequencing

---

## 5. Technical Architecture

### 5.1 Technology Stack

**Frontend:**

- Next.js 16.1.2 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Tanstack Table
- React Hook Form + Zod validation

**Backend:**

- Next.js API Routes (Server Actions)
- PostgreSQL database
- Drizzle ORM
- Better Auth (authentication)

**Infrastructure:**

- Node.js runtime
- Deployment: Vercel/self-hosted
- Database: PostgreSQL 15+

### 5.2 Database Schema

**Core Tables:**

- `user`, `session`, `account` - Authentication
- `barang` - Inventory items
- `kategori`, `satuan` - Item master data
- `pegawai`, `jabatan` - Employee management
- `pihak_ketiga` - External parties
- `asal_pembelian` - Procurement sources
- `rekening` - Bank accounts
- `spb`, `spb_detail` - Procurement requests
- `sppb`, `sppb_detail` - Approvals
- `bast_masuk`, `bast_masuk_detail` - Incoming goods
- `bast_keluar`, `bast_keluar_detail` - Outgoing goods
- `stock_opname`, `stock_opname_detail` - Inventory counts
- `mutasi_barang` - Stock mutation history

### 5.3 Key Design Patterns

- Server-side rendering (SSR)
- Server Actions for mutations
- Optimistic UI updates
- Form validation with Zod schemas
- Transaction-based data consistency
- Audit trail via mutation records

---

## 6. Data Integrity and Business Logic

### 6.1 Stock Management Rules

1. Stock values derived from transactions only
2. All stock changes generate mutation records
3. Negative stock prevented
4. Edit/delete operations validate current stock availability
5. Stock Opname provides adjustment mechanism

### 6.2 Document Workflow Rules

1. SPB → SPPB → BAST Keluar (sequential flow)
2. Status transitions enforce business rules
3. Documents immutable after approval/completion
4. Unique document numbers enforced
5. Reference integrity maintained

### 6.3 Validation Rules

- Required fields enforced
- Unique constraints (item names, codes, document numbers)
- Foreign key integrity
- Date validations
- Quantity validations (positive numbers)
- Role-based action permissions

---

## 7. Security Features

### 7.1 Authentication & Authorization

- Session-based authentication
- Secure password hashing
- Role-based access control (RBAC)
- Route-level permission checks
- Server-action authorization
- IP and user agent tracking

### 7.2 Data Protection

- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)
- CSRF protection
- Input sanitization and validation
- Secure session management

### 7.3 Audit Trail

- Created/updated timestamps on all records
- User tracking for actions
- Mutation history preserves transaction trail
- Document reference chains
- Ban tracking with reasons

---

## 8. User Workflows

### 8.1 Procurement Request (Petugas)

1. Login to system
2. View employee linkage status
3. Create new SPB
4. Add requested items
5. Submit for approval
6. Track approval status
7. View generated SPPB

### 8.2 Approval Process (Supervisor/Admin)

1. Review pending SPB requests
2. Evaluate quantities and justifications
3. Approve or reject with notes
4. System generates SPPB on approval
5. Track SPPB fulfillment

### 8.3 Goods Receipt (Admin)

1. Receive goods from supplier
2. Create BAST Masuk
3. Enter supplier details
4. Record received quantities and prices
5. Submit → stock automatically updated
6. Print BAST for signature

### 8.4 Goods Delivery (Admin)

1. Review approved SPPB (Menunggu BAST status)
2. Create BAST Keluar from SPPB
3. Record delivery parties
4. Confirm quantities and pricing
5. Submit → stock deducted, SPPB marked complete
6. Print BAST for signature
7. Toggle print status when printed

### 8.5 Stock Opname (Admin)

1. Create Stock Opname session
2. Assign responsible officer
3. Conduct physical count
4. Enter physical quantities
5. Review variances
6. Finalize session → adjustments applied
7. Review mutation records

---

## 9. Reporting Capabilities

### 9.1 Available Reports

- **Dashboard Analytics**
  - Current stock levels
  - Low stock alerts
  - Category distribution
  - Fast/slow moving items

- **Document Archives**
  - All SPB by date range
  - All SPPB by date range
  - All BAST by date range
  - Status-based filtering

- **Financial Reports**
  - Price history per item
  - Purchase value trends
  - Supplier comparison

- **Inventory Reports**
  - Current stock status
  - Stock movement history
  - Stock Opname results

### 9.2 Export Capabilities

- Print-friendly views
- PDF generation (via browser print)
- Data tables with download options

---

## 10. Future Enhancements

### 10.1 Planned Features

- Excel export functionality
- Advanced reporting dashboard
- Email notifications for approvals
- Automated low-stock alerts
- Barcode/QR code integration
- Mobile responsive improvements
- API for external integrations
- Advanced search with filters
- Batch operations
- Document templates

### 10.2 Scalability Considerations

- Database query optimization
- Caching strategies
- Pagination on all list views
- Background job processing
- File attachment support
- Multi-location support

---

## 11. Glossary

| Term         | Description                                               |
| ------------ | --------------------------------------------------------- |
| BAPB         | Berita Acara Pemeriksaan Barang (Goods Inspection Report) |
| BAST         | Berita Acara Serah Terima (Handover Report)               |
| Petugas      | Officer/Staff (operational role)                          |
| PPTK/PPK     | Government procurement official roles                     |
| SPB          | Surat Permintaan Barang (Goods Request Letter)            |
| SPPB         | Surat Persetujuan Permintaan Barang (Approval Letter)     |
| Stock Opname | Physical inventory count/stocktaking                      |
| UOM          | Unit of Measurement                                       |

---

## 12. Support and Maintenance

### 12.1 System Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Minimum screen resolution: 1366x768
- Stable internet connection

### 12.2 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 12.3 Server Requirements

- Node.js 18+
- PostgreSQL 15+
- 2GB RAM minimum
- 10GB storage minimum

---

**Document End**
