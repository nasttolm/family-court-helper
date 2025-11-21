# Mock Data - Development Guide
<!-- test -->

## Overview

Mock data has been added to the Dashboard for frontend development and demonstration purposes.

## Current Mock Data

**Location:** `src/lib/mockData.js`

**Sample Applications:** 5 applications with various statuses:
- 2 Completed applications (100% progress)
- 3 Draft applications (20%, 40%, 65% progress)

**Data includes:**
- Parent information
- Children details (names, ages, schools)
- Special Educational Needs (SEND) information
- Social care involvement history
- Health information
- Education details

## How to Use

### Enable Mock Data (Default)
In `src/app/dashboard/page.js`:
```javascript
const USE_MOCK_DATA = true  // Shows 5 sample applications
```

### Disable Mock Data
In `src/app/dashboard/page.js`:
```javascript
const USE_MOCK_DATA = false  // Uses localStorage (empty by default)
```

## Visual Indicators

When mock data is enabled, you'll see:
- **Amber warning banner** at the top of Dashboard
- Message: "Development Mode - Using Mock Data"

## Files Using Mock Data

1. `src/lib/mockData.js` - Mock data source
2. `src/app/dashboard/page.js` - Dashboard using mock data

## When to Remove

Remove mock data when:
1. Supabase backend is integrated
2. API routes are created (`/api/applications`)
3. Real database queries are implemented

## How to Remove

### Step 1: Update Dashboard
```javascript
// In src/app/dashboard/page.js

// Remove this import
import { getApplications } from '@/lib/mockData'

// Remove this constant
const USE_MOCK_DATA = true

// Replace mock data call
const apps = getApplications(USE_MOCK_DATA)

// With actual API call
const response = await fetch('/api/applications')
const apps = await response.json()
```

### Step 2: Delete Mock Files
```bash
rm src/lib/mockData.js
rm MOCK_DATA_README.md
```

### Step 3: Remove Warning Banner
In `src/app/dashboard/page.js`, remove:
```javascript
{USE_MOCK_DATA && (
  <div className="mb-6 bg-amber-50...">
    ...warning banner...
  </div>
)}
```

## Helper Functions (in mockData.js)

```javascript
// Get all applications
getApplications(useMockData)

// Get single application by ID
getApplicationById(id, useMockData)

// Save applications to localStorage
saveApplications(applications)

// Delete application
deleteApplication(id)
```

## Notes

- Mock data is read-only in Dashboard
- Changes are NOT persisted
- Real user data will come from Supabase when integrated
- Helper functions provide temporary localStorage support

---

**Remember:** This is temporary data for frontend development only!
