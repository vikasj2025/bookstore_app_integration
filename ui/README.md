# Maven Wrapper Dashboard

A modern web dashboard for the Maven Wrapper Bootstrap system, providing configuration management and real-time build monitoring.

## Features

- **Configuration Dashboard**: Set up Maven wrapper bootstrap with project discovery and templates
- **Real-time Monitoring**: Live build status tracking with WebSocket integration
- **System Health**: Monitor API health, cache performance, and system metrics
- **Secure Authentication**: JWT-based authentication with automatic token refresh
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Headless UI with custom component library
- **State Management**: React hooks with context for auth
- **Real-time**: Socket.IO client for WebSocket connections
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Testing**: Jest + Testing Library + Playwright
- **Build**: Vite-powered Next.js build system

## Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Maven Wrapper Bootstrap API running (see API_SPECS)

### Installation

```bash
# Clone and install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update API endpoints in .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1" >> .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws" >> .env.local
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start

# Or serve static files
npm run build && npx serve out
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run e2e` - Run end-to-end tests with Playwright
- `npm run e2e:ui` - Run E2E tests with UI mode

### Storybook
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

### Production
- `npm run build` - Build optimized production bundle
- `npm start` - Start production server
- `npm run analyze` - Analyze bundle size

## Project Structure

```
ui/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   └── layout/         # Layout components (Header, Sidebar)
│   ├── pages/              # Next.js pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API client services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles and Tailwind config
├── public/                 # Static assets
├── tests/                  # Test files
├── .storybook/            # Storybook configuration
└── docs/                  # Documentation
```

## API Integration

The dashboard integrates with the Maven Wrapper Bootstrap API:

- **Bootstrap Operations**: Initialize and monitor wrapper setup
- **Configuration Discovery**: Auto-detect project settings
- **Download Management**: Secure Maven wrapper downloads
- **Cache Management**: Monitor and control Redis cache
- **System Monitoring**: Health checks and performance metrics

### Authentication

JWT-based authentication with automatic token refresh:

```typescript
// Login
const { login } = useAuth();
await login('user@example.com', 'password');

// Protected routes
export default withAuth(MyComponent);
```

### Real-time Updates

WebSocket integration for live updates:

```typescript
// Subscribe to bootstrap updates
const { status } = useBootstrapWebSocket(bootstrapId);

// Subscribe to build monitoring
const { builds } = useBuildMonitoringWebSocket(projectId);
```

## Configuration

### Environment Variables

Key environment variables (see `.env.example`):

- `NEXT_PUBLIC_API_BASE_URL` - API base URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_AUTH_DOMAIN` - Authentication domain
- `NEXT_PUBLIC_ENVIRONMENT` - Environment name

### API Client

Configured with automatic retry, error handling, and authentication:

```typescript
import { apiClient } from '@/services/api';

// Automatic authentication headers
const response = await apiClient.get('/bootstrap/status');

// Error handling with retry
const data = await withRetry(() => 
  apiClient.post('/bootstrap', request)
);
```

## Testing

### Unit Tests

Jest + Testing Library for component testing:

```bash
# Run all tests
npm test

# Run specific test file
npm test Button.test.tsx

# Generate coverage
npm run test:coverage
```

### E2E Tests

Playwright for end-to-end testing:

```bash
# Run E2E tests
npm run e2e

# Run with UI
npm run e2e:ui

# Run specific test
npx playwright test login.spec.ts
```

### Component Testing

Storybook for component development and testing:

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## Deployment

### Docker

```bash
# Build image
docker build -t maven-wrapper-dashboard .

# Run container
docker run -p 3000:3000 maven-wrapper-dashboard
```

### Static Export

```bash
# Build static site
npm run build
npm run export

# Serve static files
npx serve out
```

### Vercel/Netlify

1. Connect repository
2. Set environment variables
3. Deploy with automatic builds

## Performance

### Optimization Features

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: API response caching with stale-while-revalidate
- **Lazy Loading**: Component and route lazy loading

### Performance Monitoring

```bash
# Analyze bundle size
npm run analyze

# Lighthouse audit
npx lighthouse http://localhost:3000

# Core Web Vitals
npm run build && npm start
# Check /api/vitals endpoint
```

## Accessibility

### Features

- **ARIA Labels**: Comprehensive ARIA attributes
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Optimized for screen readers
- **Color Contrast**: WCAG AA compliant colors
- **Focus Management**: Visible focus indicators

### Testing

```bash
# Automated accessibility testing
npm run test:a11y

# Manual testing with screen reader
# Use NVDA, JAWS, or VoiceOver
```

## Security

### Implemented Measures

- **CSP Headers**: Content Security Policy
- **XSS Protection**: Input sanitization
- **HTTPS Only**: Secure connections required
- **JWT Security**: Secure token handling
- **Environment Variables**: No secrets in code

### Security Headers

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```bash
   # Check API URL in .env.local
   echo $NEXT_PUBLIC_API_BASE_URL
   
   # Test API connectivity
   curl $NEXT_PUBLIC_API_BASE_URL/health
   ```

2. **WebSocket Connection Issues**
   ```bash
   # Check WebSocket URL
   echo $NEXT_PUBLIC_WS_URL
   
   # Verify WebSocket endpoint
   wscat -c $NEXT_PUBLIC_WS_URL
   ```

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node modules
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Type Errors**
   ```bash
   # Run type check
   npm run type-check
   
   # Update types
   npm update @types/node @types/react
   ```

### Debug Mode

```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG=true npm run dev

# Check browser console for detailed logs
```

### Health Checks

- **Frontend**: `http://localhost:3000/api/health`
- **API**: `${API_BASE_URL}/monitoring/health`
- **WebSocket**: Check browser network tab

## Contributing

1. **Setup Development Environment**
   ```bash
   git clone <repository>
   cd ui
   npm install
   cp .env.example .env.local
   ```

2. **Development Workflow**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes and test
   npm run dev
   npm test
   npm run e2e
   
   # Commit and push
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

3. **Code Standards**
   - TypeScript for all new code
   - ESLint + Prettier for formatting
   - Jest tests for components
   - Playwright tests for user flows
   - Storybook stories for UI components

## Support

- **Documentation**: `/docs` directory
- **API Reference**: See API_SPECS in requirements
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## License

MIT License - see LICENSE file for details.
