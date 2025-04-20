# SlotJack

A modern web application built with Next.js, featuring mobile-responsive layouts and optimized for deployment.

## Features

- Mobile-responsive layout that adapts to various screen sizes
- Slide-out navigation on mobile devices
- Optimized UI elements for touch devices
- Proper spacing and readability on small screens

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Minodevs/slotjack.git

# Navigate to the project directory
cd slotjack

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Deployment

This project is configured for easy deployment using Next.js's standalone output.

```bash
# Build the production version
npm run build

# Create a deployment package
npm run deploy-package
```

The deployment package will be available in the `deployment` directory, ready to be deployed to any Node.js hosting environment.

### Deployment Instructions

1. Copy all contents from the `deployment` directory to your server
2. Install Node.js 18.17.0 or later on your server
3. Run the server:
   ```bash
   node server.js
   ```

By default, the server will run on port 3000. You can change this by setting the PORT environment variable:

```bash
PORT=8080 node server.js
```

## Development

```bash
# Start the development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start the production server locally
npm run start
```

## Mobile Responsiveness

The application includes:

- Adaptive navigation with a hamburger menu on mobile
- Touch-friendly UI elements
- Properly scaled content for all screen sizes
- Optimized typography and spacing
- Efficient layout for mobile bandwidth

## License

ISC License
