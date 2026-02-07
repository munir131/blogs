# Eleventy High Performance Blog

A starter repository for a blog web site using the Eleventy static site generator.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 24 LTS recommended)
- npm (usually comes with Node.js)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd eleventy-high-performance-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

To start the development server with live reload and watch mode for CSS and JS:

```bash
npm run watch
```

Alternatively, to just serve the site without watching for JS/Test changes (but still watching 11ty and CSS):

```bash
npm run serve
```

The site will be available at `http://localhost:8080` by default.

## Building for Production

To build the project for production:

```bash
npm run build
```

This command cleans the output directory, builds the CSS and JS, runs Eleventy, and executes tests.

## Scripts available

- `npm run watch`: Runs the project in development mode (server + watchers).
- `npm run serve`: Builds CSS and serves the site.
- `npm run build`: Full production build (clean + build + test).
- `npm run debug`: Runs Eleventy in debug mode.
- `npm run test`: Runs the test suite.
