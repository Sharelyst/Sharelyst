#!/usr/bin/env pwsh

# Set environment to deployment
$env:EXPO_PUBLIC_ENV = "deployment"

# Navigate to the frontend directory
Set-Location -Path "$PSScriptRoot\SharelystApp"

# Install dependencies
npm install

# Start Expo with cache cleared
npx expo start -c
