# Build script for Terms & Conditions Detector Extension

Write-Host "Building TypeScript Extension..." -ForegroundColor Cyan

# Check if node is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the extension
Write-Host "Compiling TypeScript files..." -ForegroundColor Yellow
npm run build:extension

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful!" -ForegroundColor Green
    Write-Host "Extension files are in the 'public' folder" -ForegroundColor Green
    Write-Host "Load the extension from: chrome://extensions/" -ForegroundColor Cyan
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
