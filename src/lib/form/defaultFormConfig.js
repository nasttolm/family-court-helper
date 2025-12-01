// Default form configuration
// SINGLE SOURCE OF TRUTH - edit only here

export const DEFAULT_FORM_CONFIG = {
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
          title: "Your Full Name"
        },
        {
          type: "text",
          name: "applicantEmail",
          title: "Your Email Address",
          inputType: "email",
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
          inputType: "date"
        },
        {
          type: "text",
          name: "applicantAddress",
          title: "Your Address"
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
          title: "Other Parent's Full Name"
        },
        {
          type: "text",
          name: "otherParentAddress",
          title: "Other Parent's Address"
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
              title: "Child's Full Name"
            },
            {
              type: "text",
              name: "childDOB",
              title: "Date of Birth",
              inputType: "date"
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
              visibleIf: "{panel.childHasSEND} = true"
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
              visibleIf: "{panel.childHealthIssues} = true"
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
        },
        {
          type: "comment",
          name: "currentArrangementDetails",
          title: "Please describe the current arrangement in detail",
          description: "Include information about daily routines, school arrangements, etc.",
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
        },
        {
          type: "comment",
          name: "proposedArrangementDetails",
          title: "Please describe your proposed arrangement in detail",
          description: "Include details about schooling, daily routines, and why this arrangement is best for the children",
        },
        {
          type: "comment",
          name: "proposedContactSchedule",
          title: "Proposed contact schedule with the other parent",
          description: "When and how often will the children see the other parent? Include weekdays, weekends, and holidays",
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
        }
      ]
    }
  ]
}
