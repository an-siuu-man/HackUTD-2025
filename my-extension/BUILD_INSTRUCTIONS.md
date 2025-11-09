# Terms & Conditions Detector

A Chrome/Edge browser extension that automatically detects and flags links containing "terms", "conditions", "privacy", or "policy" with a floating cross overlay.

## Features

- **Always Running**: Background worker runs persistently
- **Floating Cross Overlay**: ❌ positioned directly on flagged links
- **Auto-Detection**: Scans for terms/conditions/privacy/policy links
- **Dynamic Monitoring**: Watches for new links added to the page
- **TypeScript**: Fully typed codebase

## Installation & Setup

### Prerequisites
- Node.js 18+ installed

### Build the Extension

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript files:
```bash
npm run build:extension
```

This compiles the TypeScript files in `src/` to JavaScript in `public/`.

### Load in Browser

1. Open Chrome/Edge: `chrome://extensions/` or `edge://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `public` folder

## Development

- **Source files**: `src/*.ts` (TypeScript)
- **Compiled output**: `public/*.js` (JavaScript)
- **Build command**: `npm run build:extension`

## How It Works

The extension detects links like:
```html
<a href="/legal/terms">terms and conditions</a>
<a href="/privacy">Privacy policy</a>
```

And adds:
- Floating ❌ cross overlay
- Red border around the link
- Stays positioned on scroll

## Files Structure

```
my-extension/
├── src/
│   ├── background.ts      # Background worker (TypeScript)
│   └── content.ts         # Content script (TypeScript)
├── public/
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Compiled background worker
│   ├── content.js         # Compiled content script
│   └── content.css        # Overlay styles
├── package.json
└── tsconfig.json
```

## License

MIT License
