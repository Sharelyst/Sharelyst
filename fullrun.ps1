#!/usr/bin/env pwsh

# Get the script directory
$projectRoot = $PSScriptRoot

# Start backend in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:EXPO_PUBLIC_ENV='development'; cd '$projectRoot\backend'; npm install; npm run dev"

# Start frontend in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:EXPO_PUBLIC_ENV='development'; cd '$projectRoot\SharelystApp'; npm install; npx expo start"

Write-Host "Started backend and frontend in separate terminals"
