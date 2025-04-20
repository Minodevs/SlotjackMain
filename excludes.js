/**
 * This file contains patterns for files/directories that should be excluded from the build
 * Used by both the build script and webpack configuration
 */

module.exports = {
  // API routes that use Node.js modules that aren't compatible with static export
  apiExcludes: [
    '**/api/**',
    '**/api/list-market-images/**',
    '**/api/upload/**',
    '**/api/market/items/**',
  ]
}; 