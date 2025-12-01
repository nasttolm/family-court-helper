// Form storage utilities for localStorage (MVP)
// NOTE: This is deprecated - use /api/form-config instead
// Kept for backward compatibility only

import { DEFAULT_FORM_CONFIG } from './defaultFormConfig'

const FORM_CONFIG_KEY = 'form_config'
const FORM_VERSION_KEY = 'form_version'

// Import default config from centralized location (see defaultFormConfig.js)

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
