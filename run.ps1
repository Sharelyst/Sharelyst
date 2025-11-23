#!/usr/bin/env pwsh

# Navigate to the frontend directory
Set-Location -Path "$PSScriptRoot\SharelystApp"

# Install dependencies
npm install

# Start Expo with cache cleared
npx expo start -c
