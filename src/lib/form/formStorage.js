// Form storage utilities for localStorage (MVP)
// Will be replaced with Supabase in Phase 14

const FORM_CONFIG_KEY = 'form_config'
const FORM_VERSION_KEY = 'form_version'

// Default form configuration based on CLAUDE.md requirements
const DEFAULT_FORM_CONFIG = {
  title: "Child Custody Application Form",
  description: "Complete this form to prepare your court documents",
  showProgressBar: "top",
  showQuestionNumbers: "off",
  pages: [
    {
      name: "about-you",
      title: "About You",
      description: "Please provide your personal information",
      elements: [
        {
          type: "text",
          name: "applicantName",
          title: "Your Full Name",
          isRequired: true
        },
        {
          type: "text",
          name: "applicantEmail",
          title: "Your Email Address",
          inputType: "email",
          isRequired: true,
          validators: [
            {
              type: "email",
              text: "Please enter a valid email address"
            }
          ]
        },
        {
          type: "text",
          name: "applicantDOB",
          title: "Your Date of Birth",
          inputType: "date",
          isRequired: true
        },
        {
          type: "text",
          name: "applicantAddress",
          title: "Your Address",
          isRequired: true
        },
        {
          type: "text",
          name: "applicantPhone",
          title: "Your Phone Number",
          inputType: "tel"
        }
      ]
    },
    {
      name: "other-parent",
      title: "About the Other Parent",
      description: "Please provide information about the other parent",
      elements: [
        {
          type: "text",
          name: "otherParentName",
          title: "Other Parent's Full Name",
          isRequired: true
        },
        {
          type: "text",
          name: "otherParentAddress",
          title: "Other Parent's Address",
          isRequired: true
        },
        {
          type: "text",
          name: "otherParentPhone",
          title: "Other Parent's Phone Number",
          inputType: "tel"
        },
        {
          type: "text",
          name: "otherParentEmail",
          title: "Other Parent's Email Address",
          inputType: "email",
          validators: [
            {
              type: "email",
              text: "Please enter a valid email address"
            }
          ]
        }
      ]
    },
    {
      name: "children",
      title: "About the Children",
      description: "Please provide information about each child",
      elements: [
        {
          type: "paneldynamic",
          name: "children",
          title: "Children Information",
          description: "Add details for each child involved in this application",
          minPanelCount: 1,
          panelAddText: "Add Another Child",
          panelRemoveText: "Remove Child",
          templateElements: [
            {
              type: "text",
              name: "childName",
              title: "Child's Full Name",
              isRequired: true
            },
            {
              type: "text",
              name: "childDOB",
              title: "Date of Birth",
              inputType: "date",
              isRequired: true
            },
            {
              type: "radiogroup",
              name: "childGender",
              title: "Gender",
              choices: ["Male", "Female", "Other", "Prefer not to say"]
            },
            {
              type: "text",
              name: "childSchool",
              title: "Current School"
            },
            {
              type: "boolean",
              name: "childHasSEND",
              title: "Does this child have special educational needs or disabilities (SEND)?",
              defaultValue: false
            },
            {
              type: "comment",
              name: "childSENDDetails",
              title: "Please provide details about SEND",
              visibleIf: "{panel.childHasSEND} = true",
              isRequired: true
            },
            {
              type: "boolean",
              name: "childHealthIssues",
              title: "Does this child have any health issues?",
              defaultValue: false
            },
            {
              type: "comment",
              name: "childHealthDetails",
              title: "Please provide details about health issues",
              visibleIf: "{panel.childHealthIssues} = true",
              isRequired: true
            }
          ]
        }
      ]
    },
    {
      name: "current-situation",
      title: "Current Situation",
      description: "Please describe the current living arrangements",
      elements: [
        {
          type: "radiogroup",
          name: "currentLivingArrangement",
          title: "Where do the children currently live?",
          isRequired: true,
          choices: [
            "With me",
            "With the other parent",
            "Split between both parents",
            "With other family members",
            "Other"
          ]
        },
        {
          type: "text",
          name: "currentLivingOther",
          title: "Please specify",
          visibleIf: "{currentLivingArrangement} = 'Other'",
          isRequired: true
        },
        {
          type: "comment",
          name: "currentArrangementDetails",
          title: "Please describe the current arrangement in detail",
          description: "Include information about daily routines, school arrangements, etc.",
          isRequired: true
        },
        {
          type: "boolean",
          name: "socialCareInvolvement",
          title: "Has social care ever been involved with your family?",
          defaultValue: false
        },
        {
          type: "comment",
          name: "socialCareDetails",
          title: "Please provide details about social care involvement",
          description: "Include dates and reasons for involvement",
          visibleIf: "{socialCareInvolvement} = true",
          isRequired: true
        }
      ]
    },
    {
      name: "proposed-arrangements",
      title: "Proposed Arrangements",
      description: "Please describe your proposed arrangements for the children",
      elements: [
        {
          type: "radiogroup",
          name: "proposedLivingArrangement",
          title: "Where do you propose the children should live?",
          isRequired: true,
          choices: [
            "With me",
            "With the other parent",
            "Split between both parents",
            "Other"
          ]
        },
        {
          type: "text",
          name: "proposedLivingOther",
          title: "Please specify",
          visibleIf: "{proposedLivingArrangement} = 'Other'",
          isRequired: true
        },
        {
          type: "comment",
          name: "proposedArrangementDetails",
          title: "Please describe your proposed arrangement in detail",
          description: "Include details about schooling, daily routines, and why this arrangement is best for the children",
          isRequired: true
        },
        {
          type: "comment",
          name: "proposedContactSchedule",
          title: "Proposed contact schedule with the other parent",
          description: "When and how often will the children see the other parent? Include weekdays, weekends, and holidays",
          isRequired: true
        },
        {
          type: "comment",
          name: "proposedHolidayArrangements",
          title: "Proposed holiday arrangements",
          description: "How will school holidays, birthdays, and special occasions be shared?"
        }
      ]
    },
    {
      name: "safety-concerns",
      title: "Safety Concerns",
      description: "This section is optional but important if there are any safety concerns. Your answers will be kept confidential.",
      elements: [
        {
          type: "boolean",
          name: "hasSafetyConcerns",
          title: "Do you have any safety concerns about the children being with the other parent?",
          defaultValue: false
        },
        {
          type: "checkbox",
          name: "safetyConcernTypes",
          title: "What type of concerns do you have?",
          visibleIf: "{hasSafetyConcerns} = true",
          isRequired: true,
          choices: [
            "Domestic abuse",
            "Substance abuse",
            "Mental health concerns",
            "Neglect",
            "Physical abuse",
            "Emotional abuse",
            "Other"
          ]
        },
        {
          type: "comment",
          name: "safetyConcernDetails",
          title: "Please provide details about your concerns",
          description: "Include dates, incidents, and any evidence if available. Be as specific as possible.",
          visibleIf: "{hasSafetyConcerns} = true",
          isRequired: true
        },
        {
          type: "boolean",
          name: "policeInvolvement",
          title: "Has the police been involved?",
          visibleIf: "{hasSafetyConcerns} = true",
          defaultValue: false
        },
        {
          type: "comment",
          name: "policeInvolvementDetails",
          title: "Please provide details about police involvement",
          description: "Include crime reference numbers if available",
          visibleIf: "{policeInvolvement} = true",
          isRequired: true
        },
        {
          type: "boolean",
          name: "courtOrdersExist",
          title: "Are there any existing court orders in place?",
          visibleIf: "{hasSafetyConcerns} = true",
          defaultValue: false
        },
        {
          type: "comment",
          name: "courtOrdersDetails",
          title: "Please provide details about existing court orders",
          visibleIf: "{courtOrdersExist} = true",
          isRequired: true
        }
      ]
    }
  ]
}

// Save form configuration
export function saveFormConfig(config) {
  try {
    const version = getFormVersion() + 1
    localStorage.setItem(FORM_CONFIG_KEY, JSON.stringify(config))
    localStorage.setItem(FORM_VERSION_KEY, version.toString())
    return { success: true, version }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Load form configuration (returns default if none exists)
export function loadFormConfig() {
  try {
    const config = localStorage.getItem(FORM_CONFIG_KEY)
    return config ? JSON.parse(config) : DEFAULT_FORM_CONFIG
  } catch (error) {
    console.error('Error loading form config:', error)
    return DEFAULT_FORM_CONFIG
  }
}

// Get current version number
export function getFormVersion() {
  try {
    const version = localStorage.getItem(FORM_VERSION_KEY)
    return parseInt(version || '0', 10)
  } catch (error) {
    return 0
  }
}

// Export form configuration as JSON file
export function exportFormConfig() {
  try {
    const config = loadFormConfig()
    const version = getFormVersion()
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `form_config_v${version}.json`
    link.click()
    URL.revokeObjectURL(url)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Import form configuration from file
export function importFormConfig(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result)
        resolve(config)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Clear form config (reset to default)
export function clearFormConfig() {
  localStorage.removeItem(FORM_CONFIG_KEY)
  localStorage.removeItem(FORM_VERSION_KEY)
}
