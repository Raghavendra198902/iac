# IAC DHARMA Frontend v3.0

Clean, minimal React frontend built from scratch for the IAC DHARMA platform.

## Features

- ✅ Clean React 18 with Vite
- ✅ React Router for navigation
- ✅ Minimal dependencies
- ✅ Production-ready Nginx configuration
- ✅ Docker support
- ✅ Responsive design

## Pages

1. **Home Page** - Welcome page with features and system status
2. **Dashboard Page** - Services overview and quick links
3. **404 Page** - Not found page

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

```bash
# Build image
docker build -t iac-frontend:v3-new .

# Run container
docker run -p 3000:3000 iac-frontend:v3-new
```

## Adding New Pages

1. Create new page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Layout.jsx` (if needed)

## Project Structure

```
frontend-v3-new/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx
│   ├── pages/          # Page components
│   │   ├── HomePage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── styles/         # CSS files
│   │   └── index.css
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── Dockerfile          # Production Docker build
├── nginx.conf          # Nginx configuration
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Next Steps

To add more pages, follow this pattern:

1. Create page component: `src/pages/YourNewPage.jsx`
2. Add route in `App.jsx`
3. Add styles if needed in `index.css`
