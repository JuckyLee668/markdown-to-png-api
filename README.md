# Markdown to PNG API

An Express.js service that converts Markdown text to high-quality PNG screenshots.

## Repository Information

**Repository Name**: `markdown-to-png-api`  
**Description**: A lightweight Node.js server that converts Markdown text to PNG images via API

## Features

- 📝 **Markdown to PNG Conversion**: Renders standard Markdown syntax to PNG images
- 🎨 **Beautiful Default Styling**: Carefully designed CSS for elegant rendering
- 🚀 **High Performance**: Utilizes Headless Chrome for efficient rendering
- 📱 **High-Resolution Support**: 2x device pixel ratio for crisp images
- 🔧 **Easy Deployment**: Simple Express.js app, deployable to various cloud platforms

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd markdown-to-png-api

# Install dependencies
npm install
```

### Running the Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The service runs on `http://localhost:3000` by default.

## API Usage

### Generate PNG Screenshot

**Endpoint**: `POST /`

**Headers**:
```
Content-Type: text/plain
```

**Request Body**: Markdown text content

**Example**:

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: text/plain" \
  -d "# Hello World
  
This is a **Markdown** document.

- Item 1
- Item 2
- Item 3

```javascript
console.log('Code block example');
```" \
  --output screenshot.png
```

**Response**: PNG image file

### Environment Variables

- `PORT` - Server port (default: 3000)

## Deployment

### Local Deployment

```bash
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

### Cloud Platform Deployment

This application can be easily deployed to:
- Vercel
- Railway
- Render
- Any Node.js-supported cloud platform

## Project Structure

```
markdown-to-png-api/
├── server.js          # Main application file
├── package.json       # Project dependencies
├── package-lock.json  # Dependency lock file
├── README.md          # Project documentation
└── .gitignore         # Git ignore file
```

## Tech Stack

- **Express.js** - Web server framework
- **Markdown-it** - Markdown parser
- **Puppeteer** - Headless Chrome control
- **Node.js** - Runtime environment

## Notes

- Request body size is limited to 5MB
- Initial startup downloads Chromium, which may take some time
- Appropriate sandbox security settings are recommended for production

## Development

### Local Development

```bash
# Install all dependencies (including dev dependencies)
npm install

# Run in development mode (requires nodemon)
npm run dev
```

### Building

The project uses ES modules and doesn't require a build step.

## Contributing

Issues and Pull Requests are welcome!

## License

MIT
