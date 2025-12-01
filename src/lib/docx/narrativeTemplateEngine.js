/**
 * Narrative Template Engine
 * Substitutes user data into AI-generated narrative templates
 * NO personal data is sent to AI - only substitution happens locally
 */

/**
 * Substitute data into template sections
 * @param {Object} templateSections - Template sections with placeholders
 * @param {Object} data - User application data
 * @returns {Object} - Filled template sections
 */
export function substituteDataIntoTemplate(templateSections, data) {
  const filledSections = {}

  for (const [sectionName, template] of Object.entries(templateSections)) {
    filledSections[sectionName] = fillTemplate(template, data)
  }

  return filledSections
}

/**
 * Fill a single template string with data
 * @param {string} template - Template string with {{placeholders}}
 * @param {Object} data - User data
 * @returns {string} - Filled template or "Information not provided" if no data available
 */
function fillTemplate(template, data) {
  let filled = template
  let hasAnyData = false

  // Replace all {{placeholder}} with actual data
  const placeholderRegex = /\{\{([^}]+)\}\}/g

  filled = filled.replace(placeholderRegex, (match, fieldName) => {
    const value = getFieldValue(fieldName, data)
    if (value !== null && value !== undefined && value !== '' && value !== 'no children') {
      hasAnyData = true
      return value
    }
    return match
  })

  // If no data was filled, return placeholder message for entire section
  if (!hasAnyData) {
    return 'Information not provided.'
  }

  // Clean up sentences with unfilled placeholders
  // Split by sentence and remove sentences that still have {{placeholders}}
  const sentences = filled.split(/(?<=[.!?])\s+/)
  const cleanedSentences = sentences.filter(sentence => {
    // Remove sentence if it contains unfilled placeholders
    return !sentence.includes('{{')
  })

  filled = cleanedSentences.join(' ').trim()

  // If after cleanup nothing remains, return placeholder message
  if (!filled || filled === '.') {
    return 'Information not provided.'
  }

  // Clean up extra spaces
  filled = filled.replace(/\s+/g, ' ').trim()

  // Remove duplicate punctuation
  filled = filled.replace(/\.\s*\./g, '.').trim()

  return filled
}

/**
 * Get field value from data (handles nested fields and special cases)
 */
function getFieldValue(fieldName, data) {
  // Handle special computed fields
  if (fieldName === 'childCount') {
    return data.children?.length || 0
  }

  if (fieldName === 'childrenList') {
    return formatChildrenList(data.children || [])
  }

  if (fieldName === 'safetyConcernsStatement') {
    return formatSafetyConcerns(data)
  }

  // Handle date fields
  if (fieldName.includes('DOB') || fieldName.includes('Date')) {
    const value = data[fieldName]
    if (value) {
      return formatDate(value)
    }
  }

  // Handle boolean fields
  if (typeof data[fieldName] === 'boolean') {
    return data[fieldName] ? 'Yes' : 'No'
  }

  // Handle arrays (checkbox, etc)
  if (Array.isArray(data[fieldName])) {
    return data[fieldName].join(', ')
  }

  // Handle panel data (children array)
  if (fieldName.startsWith('panel.')) {
    // This is handled in child narratives
    return null
  }

  // Direct field access
  return data[fieldName]
}

/**
 * Format children list for narrative
 */
function formatChildrenList(children) {
  if (!children || children.length === 0) {
    return 'no children'
  }

  return children.map((child, index) => {
    const parts = []

    if (child.childName) {
      parts.push(child.childName)
    }

    if (child.childDOB) {
      const age = calculateAge(child.childDOB)
      if (age !== null) {
        parts.push(`aged ${age}`)
      }
    }

    if (child.childGender) {
      parts.push(child.childGender.toLowerCase())
    }

    return parts.join(', ')
  }).join('; ')
}

/**
 * Format safety concerns statement
 */
function formatSafetyConcerns(data) {
  if (!data.hasSafetyConcerns) {
    const childWord = data.children?.length > 1 ? 'children' : 'child'
    return `I do not have any safety concerns regarding the ${childWord} spending time with the other parent.`
  }

  let statement = `I have safety concerns regarding the ${data.children?.length > 1 ? 'children' : 'child'} being with the other parent.`

  if (data.safetyConcernTypes && data.safetyConcernTypes.length > 0) {
    statement += ` These concerns relate to: ${data.safetyConcernTypes.join(', ')}.`
  }

  if (data.safetyConcernDetails) {
    statement += ` ${data.safetyConcernDetails}`
  }

  if (data.policeInvolvement) {
    statement += ' The police have been involved.'
    if (data.policeInvolvementDetails) {
      statement += ` ${data.policeInvolvementDetails}`
    }
  }

  if (data.courtOrdersExist) {
    statement += ' There are existing court orders in place.'
    if (data.courtOrdersDetails) {
      statement += ` ${data.courtOrdersDetails}`
    }
  }

  return statement
}

/**
 * Format date to UK format
 */
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateString) {
  if (!dateString) return null
  try {
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  } catch {
    return null
  }
}

/**
 * Generate narrative sections from template and data
 * @param {Object} template - Narrative template from database
 * @param {Object} applicationData - User application data
 * @returns {Object} - Narrative sections ready for DOCX
 */
export function generateNarrativeSections(template, applicationData) {
  if (!template || !template.template_sections) {
    throw new Error('Invalid template')
  }

  const filledSections = substituteDataIntoTemplate(
    template.template_sections,
    applicationData
  )

  return filledSections
}
