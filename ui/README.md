# Online Bookstore Frontend

A modern, responsive frontend application for the Online Bookstore built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: JWT-based auth with automatic token refresh
- **State Management**: Zustand for client state, React Query for server state
- **Shopping Cart**: Persistent cart with optimistic updates
- **Responsive Design**: Mobile-first responsive design
- **Dark Mode**: System preference aware theme switching
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Testing**: Unit tests with Jest, E2E tests with Playwright
- **API Mocking**: MSW for development and testing
- **Performance**: Code splitting, lazy loading, and optimization

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git

## 🛠️ Installation

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
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_APP_NAME=Online Bookstore
   ```

## 🏃‍♂️ Development

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run storybook` | Start Storybook |
| `npm run build-storybook` | Build Storybook |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test auth.spec.ts
```

### Storybook
```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📦 Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

## 🐳 Docker Deployment

### Development
```bash
# Start development environment
docker-compose --profile dev up
```

### Production
```bash
# Build and start production environment
docker-compose --profile prod up -d
```

### Docker Commands
```bash
# Build image
docker build -t bookstore-ui .

# Run container
docker run -p 3000:3000 bookstore-ui

# Run with environment variables
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://api.example.com bookstore-ui
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth route group
│   ├── books/             # Books pages
│   ├── cart/              # Cart pages
│   ├── orders/            # Orders pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   └── forms/             # Form components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility libraries
├── mocks/                 # MSW mock handlers
├── services/              # API services
├── stores/                # Zustand stores
├── styles/                # Global styles
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Online Bookstore` |
| `NODE_ENV` | Environment | `development` |

### API Integration

The application integrates with the backend API using:
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT tokens with automatic refresh
- **Error Handling**: Centralized error handling with user-friendly messages
- **Caching**: React Query for server state caching
- **Mocking**: MSW for development and testing

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Components**: Custom component library
- **Themes**: Light/Dark mode support
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first design

## ♿ Accessibility

- **WCAG 2.1**: Level AA compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets accessibility standards

## 🚀 Performance

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Component and image lazy loading
- **Caching**: Aggressive caching strategies
- **Bundle Analysis**: Bundle size monitoring
- **Core Web Vitals**: Optimized for performance metrics

## 🔒 Security

- **CSP**: Content Security Policy headers
- **XSS Protection**: Input sanitization
- **CSRF**: Cross-site request forgery protection
- **Secure Headers**: Security-focused HTTP headers
- **Authentication**: Secure JWT token handling

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **Node modules issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Debug Mode

1. **Enable debug logging**
   ```bash
   DEBUG=* npm run dev
   ```

2. **Check network requests**
   - Open browser DevTools
   - Go to Network tab
   - Monitor API calls

## 📚 API Documentation

The application integrates with the following API endpoints:

- **Authentication**: `/auth/*`
- **Books**: `/books/*`
- **Cart**: `/cart/*`
- **Orders**: `/orders/*`
- **Health**: `/health`

Refer to the backend API documentation for detailed endpoint specifications.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended Next.js configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting section](#🐛-troubleshooting)
2. Search existing [GitHub issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information

## 🔄 Deployment Checklist

### Pre-deployment
- [ ] Run all tests (`npm run test`)
- [ ] Run E2E tests (`npm run test:e2e`)
- [ ] Check TypeScript (`npm run type-check`)
- [ ] Lint code (`npm run lint`)
- [ ] Build successfully (`npm run build`)
- [ ] Test production build locally (`npm run start`)

### Production
- [ ] Set environment variables
- [ ] Configure API endpoints
- [ ] Set up monitoring
- [ ] Configure CDN
- [ ] Set up SSL certificates
- [ ] Configure backup strategy

### Post-deployment
- [ ] Verify application loads
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify API connectivity

---

**Happy coding! 🚀**
