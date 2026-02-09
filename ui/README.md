# Online Bookstore Frontend

A modern, responsive frontend application for the Online Bookstore built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: Zustand for client state, TanStack Query for server state
- **Authentication**: JWT-based authentication with secure token storage
- **Shopping Cart**: Real-time cart management with optimistic updates
- **Responsive Design**: Mobile-first design with dark mode support
- **Accessibility**: WCAG 2.1 Level AA compliant
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Development Tools**: Storybook, ESLint, Prettier, TypeScript
- **API Mocking**: MSW (Mock Service Worker) for development and testing
- **Performance**: Code splitting, lazy loading, and optimized bundles
- **Security**: Content Security Policy, secure headers, input validation

## 📋 Prerequisites

- Node.js 18.0 or later
- npm 8.0 or later
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
   NEXT_PUBLIC_API_URL=https://api.bookstore.com/v1
   NEXT_PUBLIC_APP_ENV=development
   NEXT_PUBLIC_MOCK_API=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests with Playwright

### Storybook
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   └── providers/        # Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api-client.ts     # API client configuration
│   └── utils.ts          # Utility functions
├── services/             # API service layers
│   ├── auth.service.ts   # Authentication services
│   ├── books.service.ts  # Books services
│   ├── cart.service.ts   # Cart services
│   └── orders.service.ts # Orders services
├── store/                # State management
│   ├── auth.ts           # Authentication store
│   └── cart.ts           # Cart store
├── types/                # TypeScript type definitions
│   ├── api.ts            # API types
│   └── index.ts          # Exported types
└── mocks/                # MSW mock handlers
    ├── handlers.ts       # API mock handlers
    ├── data.ts           # Mock data
    ├── browser.ts        # Browser MSW setup
    └── server.ts         # Node MSW setup
```

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS:

### Colors
- **Primary**: Blue palette for main actions and branding
- **Secondary**: Gray palette for text and subtle elements
- **Success**: Green for positive actions and states
- **Warning**: Yellow for caution and warnings
- **Error**: Red for errors and destructive actions

### Typography
- **Font Family**: Inter (sans-serif)
- **Font Sizes**: Responsive scale from xs (12px) to 6xl (60px)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Input**: Form inputs with validation states
- **Modal**: Accessible modal dialogs
- **Card**: Content containers
- **Badge**: Status indicators
- **Alert**: Notification messages

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.bookstore.com/v1` |
| `NEXT_PUBLIC_APP_ENV` | Application environment | `development` |
| `NEXT_PUBLIC_MOCK_API` | Enable API mocking | `true` |
| `NEXT_PUBLIC_ENABLE_DARK_MODE` | Enable dark mode | `true` |
| `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` | Default pagination size | `20` |
| `NEXT_PUBLIC_MAX_PAGE_SIZE` | Maximum pagination size | `100` |

### API Configuration

The application is configured to work with the Online Bookstore API. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your backend API.

### Mock API

For development and testing, the application uses MSW (Mock Service Worker) to mock API responses. This allows development without a running backend.

To disable mocking:
```env
NEXT_PUBLIC_MOCK_API=false
```

## 🧪 Testing

### Unit Tests
Unit tests are written with Jest and React Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
End-to-end tests use Playwright:

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test auth.spec.ts
```

### Test Coverage
The project maintains high test coverage:
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+
- **Statements**: 70%+

## 📚 Storybook

Storybook is used for component development and documentation:

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

Storybook includes:
- Component documentation
- Interactive component playground
- Accessibility testing
- Visual regression testing

## 🚀 Deployment

### Docker

1. **Build the Docker image**
   ```bash
   docker build -t bookstore-ui .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.bookstore.com/v1 bookstore-ui
   ```

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

### Environment-Specific Builds

```bash
# Staging build
NEXT_PUBLIC_API_URL=https://staging-api.bookstore.com/v1 npm run build

# Production build
NEXT_PUBLIC_API_URL=https://api.bookstore.com/v1 npm run build
```

## 🔒 Security

### Content Security Policy
The application implements a strict CSP to prevent XSS attacks.

### Authentication
- JWT tokens stored in secure HTTP-only cookies
- Automatic token refresh
- Secure logout with token invalidation

### Input Validation
- Client-side validation with Zod schemas
- Server-side validation integration
- XSS protection for user-generated content

## ♿ Accessibility

The application follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets minimum contrast ratios
- **Focus Management**: Visible focus indicators and logical tab order
- **Alternative Text**: Images have descriptive alt text

### Accessibility Testing

```bash
# Run accessibility tests
npm run test:a11y

# Manual testing with screen reader
# Use NVDA, JAWS, or VoiceOver
```

## 📱 Progressive Web App

The application includes PWA features:

- **Service Worker**: Caching and offline support
- **Web App Manifest**: Installable on mobile devices
- **Offline Functionality**: Basic functionality without network

## 🎯 Performance

### Optimization Techniques
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components and images loaded on demand
- **Bundle Analysis**: Regular bundle size monitoring
- **Image Optimization**: Next.js Image component with WebP support
- **Caching**: Aggressive caching with stale-while-revalidate

### Performance Monitoring

```bash
# Analyze bundle size
npx @next/bundle-analyzer

# Run Lighthouse audit
npm run lighthouse
```

## 🐛 Debugging

### Development Tools
- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network Tab**: API request monitoring
- **Console Logging**: Structured logging in development

### Common Issues

1. **API Connection Issues**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify backend is running
   - Check network connectivity

2. **Authentication Issues**
   - Clear browser cookies and localStorage
   - Check token expiration
   - Verify API credentials

3. **Build Issues**
   - Clear `.next` directory
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style
- Follow the existing code style
- Use TypeScript for all new code
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🗺️ Roadmap

### Upcoming Features
- [ ] Advanced search with filters
- [ ] Book recommendations
- [ ] Reading lists and favorites
- [ ] Social features (reviews, ratings)
- [ ] Multi-language support
- [ ] Enhanced mobile experience
- [ ] Real-time notifications
- [ ] Advanced analytics

### Technical Improvements
- [ ] GraphQL integration
- [ ] Server-side rendering optimization
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] A/B testing framework
- [ ] Enhanced security measures

---

**Happy coding! 📚✨**
