import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { generateNarrativeSections } from './narrativeTemplateEngine'

/**
 * Generate narrative-style DOCX document from application data using AI template
 * @param {Object} application - Application object with dynamic_data
 * @param {Object} narrativeTemplate - Narrative template from database
 * @returns {Document} - DOCX Document object
 */
export function generateNarrativeDocument(application, narrativeTemplate) {
  if (!application) {
    throw new Error('Application not found')
  }

  if (!narrativeTemplate) {
    throw new Error('Narrative template not found')
  }

  const data = application.dynamic_data

  // Fill template with user data
  const narrativeSections = generateNarrativeSections(narrativeTemplate, data)

  const children = []

  // Document Title
  children.push(
    new Paragraph({
      text: 'Child Custody Application Summary',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  )

  // APPLICANT INFORMATION
  if (narrativeSections.applicant) {
    children.push(createSectionHeading('APPLICANT INFORMATION'))
    children.push(
      new Paragraph({
        text: narrativeSections.applicant,
        spacing: { after: 300 }
      })
    )
  }

  // RESPONDENT INFORMATION
  if (narrativeSections.respondent) {
    children.push(createSectionHeading('RESPONDENT INFORMATION'))
    children.push(
      new Paragraph({
        text: narrativeSections.respondent,
        spacing: { after: 300 }
      })
    )
  }

  // CHILDREN
  if (narrativeSections.children) {
    children.push(createSectionHeading('CHILDREN'))

    // Split by double newlines if AI created multiple paragraphs
    const childParagraphs = narrativeSections.children.split('\n\n')
    childParagraphs.forEach(para => {
      if (para.trim()) {
        children.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 }
          })
        )
      }
    })

    // Add spacing after children section
    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 }
      })
    )
  }

  // CURRENT LIVING ARRANGEMENTS
  if (narrativeSections.currentSituation) {
    children.push(createSectionHeading('CURRENT LIVING ARRANGEMENTS'))

    const situationParagraphs = narrativeSections.currentSituation.split('\n\n')
    situationParagraphs.forEach(para => {
      if (para.trim()) {
        children.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 }
          })
        )
      }
    })

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 }
      })
    )
  }

  // PROPOSED ARRANGEMENTS
  if (narrativeSections.proposed) {
    children.push(createSectionHeading('PROPOSED ARRANGEMENTS'))

    const proposedParagraphs = narrativeSections.proposed.split('\n\n')
    proposedParagraphs.forEach(para => {
      if (para.trim()) {
        children.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 }
          })
        )
      }
    })

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 }
      })
    )
  }

  // SAFETY CONCERNS
  if (narrativeSections.safety) {
    children.push(createSectionHeading('SAFETY CONCERNS'))

    const safetyParagraphs = narrativeSections.safety.split('\n\n')
    safetyParagraphs.forEach(para => {
      if (para.trim()) {
        children.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 }
          })
        )
      }
    })
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        children: children
      }
    ]
  })

  return doc
}

/**
 * Helper: Create section heading
 */
function createSectionHeading(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: {
      bottom: {
        color: '000000',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6
      }
    }
  })
}
