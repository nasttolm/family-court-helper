// Test API endpoints
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000'

async function testFormConfigAPI() {
  console.log('\n========================================')
  console.log('Testing /api/form-config...')
  console.log('========================================\n')

  try {
    const response = await fetch(`${BASE_URL}/api/form-config`)
    const data = await response.json()

    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ Form config API works!')
      console.log('Version:', data.version)
      console.log('From database:', data.fromDatabase)
      return true
    } else {
      console.log('\n❌ Form config API failed!')
      return false
    }
  } catch (error) {
    console.log('\n❌ Error:', error.message)
    return false
  }
}

async function testNarrativeTemplateAPI() {
  console.log('\n========================================')
  console.log('Testing /api/narrative-template...')
  console.log('========================================\n')

  try {
    const response = await fetch(`${BASE_URL}/api/narrative-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
      }
    })

    const data = await response.json()

    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ Narrative template API works!')
      console.log('Cached:', data.cached)
      return true
    } else {
      console.log('\n❌ Narrative template API failed!')
      console.log('Error:', data.error)
      console.log('Details:', data.details)
      return false
    }
  } catch (error) {
    console.log('\n❌ Error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('\n')
  console.log('╔════════════════════════════════════════╗')
  console.log('║   Family Court Helper - API Tests     ║')
  console.log('╔════════════════════════════════════════╗')

  const formConfigOk = await testFormConfigAPI()

  if (!formConfigOk) {
    console.log('\n⚠️  Form config API must work before testing narrative template')
    process.exit(1)
  }

  await testNarrativeTemplateAPI()

  console.log('\n')
  console.log('═══════════════════════════════════════')
  console.log('Tests completed')
  console.log('═══════════════════════════════════════\n')
}

runTests()
