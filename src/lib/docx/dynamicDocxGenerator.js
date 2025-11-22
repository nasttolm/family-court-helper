import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { loadFormConfig } from '@/lib/form/formStorage'

/**
 * Generate DOCX document from application data
 * @param {Object} application - Application object with dynamic_data
 * @returns {Document} - DOCX Document object
 */
export function generateDynamicDocument(application) {
  if (!application) {
    throw new Error('Application not found')
  }

  // Load form config
  const formConfig = loadFormConfig()

  // 3. Generate document sections
  const children = []

  // Document Title
  children.push(
    new Paragraph({
      text: formConfig.title || 'Application Form',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  )

  // Iterate through pages (sections)
  formConfig.pages.forEach((page, pageIndex) => {
    // Check if page has any filled fields
    const hasData = page.elements.some((element) => {
      if (element.type === 'paneldynamic') {
        const panels = application.dynamic_data[element.name] || []
        return panels.length > 0
      }
      const value = application.dynamic_data[element.name]
      return value !== undefined && value !== null && value !== ''
    })

    // Page Title (Section Heading)
    children.push(
      new Paragraph({
        text: page.title,
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
    )

    // If no data in this section, show message
    if (!hasData) {
      children.push(
        new Paragraph({
          text: 'No information provided',
          italics: true,
          spacing: { after: 200 }
        })
      )
      return
    }

    // Page Elements
    page.elements.forEach((element) => {
      // Handle paneldynamic (repeating sections like children)
      if (element.type === 'paneldynamic') {
        const panels = application.dynamic_data[element.name] || []

        // Element title
        children.push(
          new Paragraph({
            text: element.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        )

        if (panels.length > 0) {
          panels.forEach((panelData, panelIndex) => {
            // Item number
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Item ${panelIndex + 1}`,
                    bold: true
                  })
                ],
                spacing: { before: 150, after: 100 }
              })
            )

            // Item fields
            element.templateElements.forEach((templateElement) => {
              const paragraphs = createElementParagraphs(
                templateElement,
                application.dynamic_data,
                panelData
              )
              children.push(...paragraphs)
            })
          })
        } else {
          children.push(
            new Paragraph({
              text: 'No items added',
              italics: true,
              spacing: { after: 100 }
            })
          )
        }
      } else {
        // Regular elements
        const paragraphs = createElementParagraphs(element, application.dynamic_data)
        children.push(...paragraphs)
      }
    })
  })

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
 * Create paragraphs for an element
 */
function createElementParagraphs(element, data, panelData = null) {
  const paragraphs = []
  const value = panelData ? panelData[element.name] : data[element.name]

  // Check visibility conditions
  if (element.visibleIf) {
    const match = element.visibleIf.match(/\{(.+?)\}\s*=\s*(.+)/)
    if (match) {
      const [, fieldName, expectedValue] = match
      const actualFieldValue = panelData ? panelData[fieldName] : data[fieldName]
      const expected = expectedValue.trim() === 'true' ? true :
                      expectedValue.trim() === 'false' ? false :
                      expectedValue.trim().replace(/['"]/g, '')

      if (actualFieldValue !== expected) {
        return paragraphs // Don't show this field
      }
    }
  }

  // Skip if no value
  if (value === undefined || value === null || value === '') {
    return paragraphs
  }

  // Format based on element type
  switch (element.type) {
    case 'text':
      const formattedValue = formatTextValue(element, value)
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: element.title + ': ', bold: true }),
            new TextRun({ text: formattedValue })
          ],
          spacing: { after: 100 }
        })
      )
      break

    case 'comment':
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: element.title + ':', bold: true })
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: value,
          spacing: { after: 150 }
        })
      )
      break

    case 'radiogroup':
    case 'dropdown':
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: element.title + ': ', bold: true }),
            new TextRun({ text: value })
          ],
          spacing: { after: 100 }
        })
      )
      break

    case 'checkbox':
      const selectedValues = Array.isArray(value) ? value.join(', ') : 'None'
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: element.title + ': ', bold: true }),
            new TextRun({ text: selectedValues })
          ],
          spacing: { after: 100 }
        })
      )
      break

    case 'boolean':
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: element.title + ': ', bold: true }),
            new TextRun({ text: value ? 'Yes' : 'No' })
          ],
          spacing: { after: 100 }
        })
      )
      break

    default:
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: element.title + ': ', bold: true }),
            new TextRun({ text: String(value) })
          ],
          spacing: { after: 100 }
        })
      )
  }

  return paragraphs
}

/**
 * Format text value (handle dates)
 */
function formatTextValue(element, value) {
  if (element.inputType === 'date' && value) {
    try {
      const date = new Date(value)
      return date.toLocaleDateString('en-GB')
    } catch {
      return value
    }
  }
  return value
}
