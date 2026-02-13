# Build Environment Dashboard

A modern, responsive web dashboard for monitoring and managing automated build environment setup and configuration. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Environment Monitoring**: Real-time status monitoring of build environments
- **Build Tool Management**: Install and manage different versions of build tools (Maven, Gradle, Node.js, Java, etc.)
- **Repository Access**: Secure configuration of private repository access
- **Health Monitoring**: Automated health checks with configurable schedules
- **Configuration Rollback**: Snapshot and rollback capabilities for environment configurations
- **Real-time Updates**: WebSocket integration for live status updates
- **Responsive Design**: Mobile-first design with dark mode support
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **API Client**: Axios with retry logic and error handling
- **Real-time**: WebSocket integration
- **Testing**: Jest + Testing Library + Playwright
- **Mocking**: MSW (Mock Service Worker)
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your API configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.buildenvironment.company.com/v1
   NEXT_PUBLIC_WS_URL=wss://api.buildenvironment.company.com/ws
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development with Mock Data

The application includes MSW for API mocking during development:

```bash
# Enable MSW in your .env.local
NEXT_PUBLIC_ENABLE_MSW=true

# Start development server
npm run dev
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run preview` - Build and start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI

### Storybook
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## Project Structure

```
ui/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main dashboard page
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── mocks/               # MSW mock handlers
│   ├── services/            # API services
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── e2e/                     # Playwright E2E tests
├── public/                  # Static assets
├── .github/workflows/       # GitHub Actions CI/CD
└── docs/                    # Documentation
```

## API Integration

The dashboard integrates with the Build Environment API:

- **Base URL**: `https://api.buildenvironment.company.com/v1`
- **WebSocket**: `wss://api.buildenvironment.company.com/ws`
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Automatic retry with exponential backoff
- **Caching**: Intelligent caching with stale-while-revalidate

### Key Endpoints

- `GET /build-environments` - List all environments
- `POST /build-environment/configure` - Create new environment
- `GET /build-tools/versions` - Get available tool versions
- `POST /build-tools/install` - Install build tool
- `GET /health-check/environment/{id}` - Perform health check
- `POST /configuration/rollback` - Rollback configuration

## Component Library

The dashboard includes a comprehensive component library:

### Core Components
- `Button` - Flexible button with variants and loading states
- `Card` - Container component with header, content, and footer
- `Badge` - Status indicators and labels
- `Loading` - Skeleton loaders and progress indicators

### Dashboard Components
- `EnvironmentStatusDashboard` - Main environment overview
- `BuildToolManager` - Tool installation and management
- `RepositoryAccessManager` - Repository credential configuration
- `HealthCheckMonitor` - Health monitoring and scheduling
- `ConfigurationRollback` - Snapshot and rollback management

### Layout Components
- `DashboardLayout` - Main application layout with navigation

## Testing Strategy

### Unit Tests
- **Framework**: Jest + Testing Library
- **Coverage**: 70%+ for statements, branches, functions, and lines
- **Location**: `src/components/__tests__/`

### Integration Tests
- **API Integration**: MSW for mocking API responses
- **Component Integration**: Testing component interactions

### E2E Tests
- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Coverage**: Critical user flows and accessibility

### Running Tests

```bash
# Unit tests
npm run test
npm run test:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui

# All tests
npm run test && npm run test:e2e
```

## Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t build-environment-dashboard .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_API_BASE_URL=https://api.buildenvironment.company.com/v1 \
     -e NEXT_PUBLIC_WS_URL=wss://api.buildenvironment.company.com/ws \
     build-environment-dashboard
   ```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.buildenvironment.company.com/v1
NEXT_PUBLIC_WS_URL=wss://api.buildenvironment.company.com/ws
NODE_ENV=production
```

## Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with WebP support
- **Caching**: Intelligent API response caching
- **Bundle Analysis**: Built-in bundle analyzer
- **Lazy Loading**: Component and route lazy loading

### Performance Targets
- **Lighthouse Score**: 90+ for Performance, Accessibility, Best Practices, SEO
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## Accessibility

### Features
- **WCAG 2.1 AA Compliance**: Full accessibility compliance
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects user motion preferences

### Testing
- **Automated**: axe-core integration in tests
- **Manual**: Keyboard and screen reader testing
- **CI/CD**: Accessibility checks in GitHub Actions

## Security

### Security Features
- **Content Security Policy**: Strict CSP headers
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Secure Headers**: Security headers configuration
- **Dependency Scanning**: Automated vulnerability scanning

### Security Best Practices
- **Environment Variables**: Sensitive data in environment variables
- **API Authentication**: JWT token-based authentication
- **HTTPS Only**: Secure communication protocols
- **Input Validation**: Client and server-side validation

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and add tests**
4. **Run tests**: `npm run test && npm run test:e2e`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow ESLint and Prettier configurations
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update documentation for API changes
- **Accessibility**: Ensure new components are accessible
- **Performance**: Consider performance impact of changes

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   ```bash
   # Check environment variables
   echo $NEXT_PUBLIC_API_BASE_URL
   
   # Test API connectivity
   curl -f $NEXT_PUBLIC_API_BASE_URL/health
   ```

2. **Build Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Issues**
   ```bash
   # Run type checking
   npm run type-check
   
   # Check for missing types
   npx tsc --noEmit --skipLibCheck
   ```

### Debug Mode

Enable debug mode for additional logging:

```env
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_VERBOSE_LOGGING=true
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [https://docs.buildenvironment.company.com](https://docs.buildenvironment.company.com)
- **Support**: [https://support.buildenvironment.company.com](https://support.buildenvironment.company.com)
- **Status Page**: [https://status.buildenvironment.company.com](https://status.buildenvironment.company.com)
- **Issues**: [GitHub Issues](https://github.com/company/build-environment-dashboard/issues)

---

**Build Environment Team**  
[build-env@company.com](mailto:build-env@company.com)
