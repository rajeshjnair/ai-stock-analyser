# AI Stock Analyser - Marketing Website

A modern, responsive Next.js static marketing website for the AI Stock Analyser platform.

## Features

- **Static Site Generation**: Built with Next.js 14 using `output: 'export'` for optimal performance
- **Modern Design**: Dark theme with gradient accents and smooth animations
- **Responsive**: Mobile-first design that works on all devices
- **SEO Optimized**: Comprehensive meta tags and semantic HTML
- **Fast Loading**: Optimized assets and minimal JavaScript

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Docker with Nginx

## Project Structure

```
frontend-website/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with SEO meta tags
│   │   ├── page.tsx             # Home/landing page
│   │   ├── features/
│   │   │   └── page.tsx         # Features page
│   │   ├── pricing/
│   │   │   └── page.tsx         # Pricing page
│   │   └── globals.css          # Global styles
│   └── components/
│       ├── Navbar.tsx           # Navigation component
│       └── Footer.tsx           # Footer component
├── public/                      # Static assets
├── Dockerfile                   # Docker build configuration
├── nginx.conf                   # Nginx configuration for static hosting
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the site.

### Build

```bash
# Build for production
npm run build

# Generate static export
npm run export
```

The static files will be in the `out` directory.

## Docker Deployment

### Build Docker Image

```bash
docker build -t stock-analyser-website .
```

### Run Container

```bash
docker run -p 80:80 stock-analyser-website
```

The website will be available at [http://localhost](http://localhost).

## Pages

### Home Page (`/`)
- Hero section with main value proposition
- Features overview (6 key features)
- How it works section (4-step process)
- Call-to-action section

### Features Page (`/features`)
- Detailed feature descriptions
- AI Analysis capabilities
- Real-time data features
- Watchlist functionality
- API access information

### Pricing Page (`/pricing`)
- Four pricing tiers:
  - Free: Basic features for getting started
  - Basic ($9.99/mo): Individual investors
  - Pro ($29.99/mo): Serious traders
  - Enterprise: Custom pricing for institutions
- Feature comparison table
- 14-day free trial offer

## Customization

### Colors
Edit the Tailwind config or globals.css to change the color scheme:
- Primary: Blue (`blue-600`)
- Secondary: Purple (`purple-600`)
- Background: Dark (`#0a0a0a`)

### Content
Update page content in:
- `/src/app/page.tsx` - Home page
- `/src/app/features/page.tsx` - Features
- `/src/app/pricing/page.tsx` - Pricing

### Navigation
Modify links in:
- `/src/components/Navbar.tsx`
- `/src/components/Footer.tsx`

## Performance

- Static site generation for fast loading
- Image optimization disabled for static export
- Gzip compression via Nginx
- Browser caching for static assets
- Minimal JavaScript bundle

## SEO

The site includes comprehensive SEO optimization:
- Meta descriptions and keywords
- Open Graph tags for social sharing
- Twitter Card metadata
- Semantic HTML structure
- Mobile-friendly viewport settings

## License

Proprietary - AI Stock Analyser Team
