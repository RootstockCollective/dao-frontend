#!/usr/bin/env node

/**
 * Build-time environment validation.
 * Ensures required NEXT_PUBLIC_* variables are set before build.
 * Run this script during the build process (e.g., in next.config.js or package.json).
 */

const requiredEnvVars = ['NEXT_PUBLIC_ROOTCAMP_NFT_ADDRESS']

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error(
    `❌ Build failed: Missing required environment variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}\n\nEnsure these are set in your .env file for the target environment.`,
  )
  process.exit(1)
}

console.log('✅ Environment validation passed')
