// ==================================================
// MOCK DATA - FOR DEVELOPMENT ONLY
// ==================================================
//
// This file contains sample application data for frontend development
// and demonstration purposes.
//
// WHEN TO REMOVE:
// 1. When Supabase backend is integrated
// 2. When API routes are created
// 3. When real database queries are implemented
//
// FILES TO UPDATE WHEN REMOVING:
// - src/app/dashboard/page.js (set USE_MOCK_DATA = false)
// - Remove import { getApplications } from '@/lib/mockData'
// - Replace getApplications() with actual API call
//
// HOW TO DISABLE:
// Set USE_MOCK_DATA = false in src/app/dashboard/page.js
//
// ==================================================

export const MOCK_APPLICATIONS = [
  {
    id: 'app-2024-001-abc123',
    status: 'completed',
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-16T14:20:00Z',
    progress: 100,
    data: {
      parentInfo: {
        yourName: 'Sarah Johnson',
        otherParentName: 'Michael Johnson',
        livingArrangement: 'Separated, living in different addresses',
        proposedCustody: 'Shared custody - alternating weeks'
      },
      children: [
        {
          name: 'Emma Johnson',
          dateOfBirth: '2015-03-12',
          currentLiving: 'With mother',
          school: 'Riverside Primary School'
        },
        {
          name: 'Oliver Johnson',
          dateOfBirth: '2017-08-24',
          currentLiving: 'With mother',
          school: 'Riverside Primary School'
        }
      ],
      specialNeeds: {
        hasSEND: true,
        details: 'Emma has dyslexia and receives additional support at school',
        support: 'Weekly sessions with learning support assistant',
        hasEHCP: false
      },
      socialCare: {
        hasInvolvement: false,
        details: '',
        currentStatus: 'No current involvement'
      },
      health: {
        hasConditions: false,
        conditions: '',
        medications: '',
        gpDetails: 'Dr. Smith, Riverside Medical Centre'
      },
      education: {
        attendance: 'Good - 96% attendance rate',
        academicProgress: 'Meeting expected standards with support',
        concerns: 'None',
        schoolContact: 'Mrs. Roberts, Head Teacher'
      }
    }
  },
  {
    id: 'app-2024-002-def456',
    status: 'draft',
    createdAt: '2024-11-18T09:15:00Z',
    updatedAt: '2024-11-18T09:45:00Z',
    progress: 40,
    data: {
      parentInfo: {
        yourName: 'David Thompson',
        otherParentName: 'Lisa Thompson',
        livingArrangement: 'Recently separated',
        proposedCustody: 'Primary residence with father, visitation rights for mother'
      },
      children: [
        {
          name: 'Sophie Thompson',
          dateOfBirth: '2018-01-15',
          currentLiving: 'With father',
          school: 'Greenfield Nursery School'
        }
      ],
      specialNeeds: {
        hasSEND: false,
        details: '',
        support: '',
        hasEHCP: false
      }
      // Other sections not yet filled
    }
  },
  {
    id: 'app-2024-003-ghi789',
    status: 'draft',
    createdAt: '2024-11-17T16:20:00Z',
    updatedAt: '2024-11-18T11:30:00Z',
    progress: 65,
    data: {
      parentInfo: {
        yourName: 'Rebecca Martinez',
        otherParentName: 'James Martinez',
        livingArrangement: 'Divorced, living separately',
        proposedCustody: 'Joint custody with flexible arrangement'
      },
      children: [
        {
          name: 'Lucas Martinez',
          dateOfBirth: '2014-06-08',
          currentLiving: 'Alternating between both parents',
          school: 'Oakwood Secondary School'
        }
      ],
      specialNeeds: {
        hasSEND: true,
        details: 'Lucas has ADHD',
        support: 'Behavioral support plan in place at school',
        hasEHCP: true
      },
      socialCare: {
        hasInvolvement: true,
        details: 'Brief involvement in 2022 regarding school attendance issues, now resolved',
        currentStatus: 'Case closed - no current involvement'
      }
      // Other sections partially filled
    }
  },
  {
    id: 'app-2024-004-jkl012',
    status: 'completed',
    createdAt: '2024-11-12T13:45:00Z',
    updatedAt: '2024-11-13T10:15:00Z',
    progress: 100,
    data: {
      parentInfo: {
        yourName: 'Anna Williams',
        otherParentName: 'Thomas Williams',
        livingArrangement: 'Separated',
        proposedCustody: 'Primary residence with mother'
      },
      children: [
        {
          name: 'Mia Williams',
          dateOfBirth: '2016-11-22',
          currentLiving: 'With mother',
          school: 'St. Mary Primary School'
        },
        {
          name: 'Noah Williams',
          dateOfBirth: '2019-04-30',
          currentLiving: 'With mother',
          school: 'Happy Days Nursery'
        }
      ],
      specialNeeds: {
        hasSEND: false,
        details: '',
        support: '',
        hasEHCP: false
      },
      socialCare: {
        hasInvolvement: false,
        details: '',
        currentStatus: 'No involvement'
      },
      health: {
        hasConditions: true,
        conditions: 'Noah has mild asthma',
        medications: 'Salbutamol inhaler as needed',
        gpDetails: 'Dr. Patel, Central Health Clinic'
      },
      education: {
        attendance: 'Excellent - 98% attendance',
        academicProgress: 'Above expected standards',
        concerns: 'None',
        schoolContact: 'Miss Johnson, Year 2 Teacher'
      }
    }
  },
  {
    id: 'app-2024-005-mno345',
    status: 'draft',
    createdAt: '2024-11-19T08:00:00Z',
    updatedAt: '2024-11-19T08:15:00Z',
    progress: 20,
    data: {
      parentInfo: {
        yourName: 'Mark Anderson',
        otherParentName: 'Claire Anderson',
        livingArrangement: '',
        proposedCustody: ''
      }
      // Just started - minimal data
    }
  }
]

// Helper function to get applications from localStorage or use mock data
// TODO: Remove this when backend is integrated
export function getApplications(useMockData = true) {
  if (useMockData) {
    // For development - return mock data
    return MOCK_APPLICATIONS
  } else {
    // For production - get from localStorage (temporary until backend ready)
    const savedApplications = localStorage.getItem('applications')
    return savedApplications ? JSON.parse(savedApplications) : []
  }
}

// Helper function to save applications
// TODO: Replace with API call when backend is ready
export function saveApplications(applications) {
  localStorage.setItem('applications', JSON.stringify(applications))
}

// Helper function to get single application by ID
// TODO: Replace with API call when backend is ready
export function getApplicationById(id, useMockData = true) {
  const applications = getApplications(useMockData)
  return applications.find(app => app.id === id)
}

// Helper function to delete application
// TODO: Replace with API call when backend is ready
export function deleteApplication(id) {
  const applications = getApplications(false) // Always use real data for deletion
  const filtered = applications.filter(app => app.id !== id)
  saveApplications(filtered)
  return filtered
}
