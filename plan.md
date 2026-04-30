You are an expert Angular 20 developer. 
Build a complete, professional frontend for a Real Estate Rental Management System.

---

## TECH STACK:
- Angular 20 (standalone components, no NgModules)
- Angular Material for UI components
- TailwindCSS for layout and custom styling
- Angular Signals for state management
- Angular HttpClient for API calls

---

## BACKEND API (already running on http://localhost:3000):

### Units:
- GET    /api/units
- GET    /api/units/:id
- POST   /api/units
- PUT    /api/units/:id
- DELETE /api/units/:id

### Contracts:
- GET    /api/contracts
- GET    /api/contracts/:id
- GET    /api/contracts/unit/:unitId
- POST   /api/contracts
- PUT    /api/contracts/:id
- DELETE /api/contracts/:id
- PATCH  /api/contracts/:id/installments/:installmentId

---

## UNIT FIELDS:
- name (اسم الوحدة)
- description (بيان الوحدة)
- type: enum ['سكني', 'طبي', 'إداري']
- isFurnished: boolean
- project (المشروع)
- developer (المطور)
- isReadyForDelivery: boolean
- isStoredInSafe: boolean

## CONTRACT FIELDS:
- unit (ObjectId → linked to unit)
- tenantName (اسم المستأجر)
- contractStartDate
- contractEndDate
- rentalDuration
- firstYearRent
- annualIncreases: [{ year, percentage, newValue }]
- collectionPeriod
- insuranceValue
- contractImageUrl
- isRented: boolean
- entryDate
- alarm
- contractWriteDate
- contractReceiveDate
- gracePeriodEndDate
- penaltyClause
- obligations: [{ description, dueDate }]
- installments: [{ amount, dueDate, isPaid }]
- totalPaid (virtual - calculated)
- totalRemaining (virtual - calculated)

---

## PAGES & FEATURES:

### 1. Dashboard Page (/)
- Cards showing:
  - Total units count
  - Rented units count
  - Available units count
  - Total collected rent
- Units breakdown by type (سكني / طبي / إداري) with chart
- Upcoming alarms/obligations table (next 30 days)
- Recent contracts list

### 2. Units Page (/units)
- Table/Grid view of all units
- Filter by type (سكني / طبي / إداري)
- Filter by isFurnished
- Filter by isReadyForDelivery
- Add new unit button → opens dialog/modal form
- Each unit row has: View, Edit, Delete actions
- Delete with confirmation dialog

### 3. Unit Detail Page (/units/:id)
- Full unit info card
- All contracts history for this unit (timeline style)
- Add new contract button for this unit

### 4. Contracts Page (/contracts)
- Table of all contracts
- Filter by isRented
- Filter by unit type
- Show totalPaid and totalRemaining per contract
- Add new contract button → opens dialog/modal form
- Each row has: View, Edit, Delete actions

### 5. Contract Detail Page (/contracts/:id)
- Full contract info
- Annual increases table
- Installments section:
  - List all installments with amount + dueDate
  - Toggle paid/unpaid button per installment
  - Progress bar: paid vs remaining
- Obligations section with due dates
- Alarm indicator if alarm date is near

---

## DESIGN REQUIREMENTS:
- Arabic RTL support (dir="rtl")
- Professional color scheme (dark navy + gold accents)
- Sidebar navigation with icons
- Responsive (desktop + tablet)
- Loading spinners on all API calls
- Success/error snackbar notifications on all actions
- Empty state illustrations when no data
- All labels and UI text in Arabic

---

## CODE REQUIREMENTS:
- Use Angular 20 standalone components
- Use Angular Signals (signal, computed, effect)
- Create a dedicated ApiService for all HTTP calls
- Use environment.ts for API base URL (http://localhost:3000)
- Lazy load all routes
- Handle API errors gracefully
- Use Angular Material dialogs for forms (add/edit)
- Use reactive forms with validation

---

## PROJECT STRUCTURE:
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       └── api.service.ts
│   ├── shared/
│   │   └── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── units/
│   │   │   ├── units-list/
│   │   │   ├── unit-detail/
│   │   │   └── unit-form/
│   │   └── contracts/
│   │       ├── contracts-list/
│   │       ├── contract-detail/
│   │       └── contract-form/
│   ├── app.routes.ts
│   └── app.component.ts
└── environments/
    └── environment.ts

Start building now. Create all files completely.