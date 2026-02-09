# Online Bookstore Frontend

A modern, responsive frontend application for an online bookstore built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: Zustand for client state, React Query for server state
- **UI Components**: Custom component library with Storybook
- **Authentication**: JWT-based authentication with automatic token refresh
- **Shopping Cart**: Real-time cart management with persistence
- **Responsive Design**: Mobile-first approach with dark mode support
- **Testing**: Comprehensive testing with Jest, React Testing Library, and Playwright
- **API Mocking**: MSW for development and testing
- **Performance**: Optimized for Core Web Vitals
- **Accessibility**: WCAG 2.1 AA compliant
- **SEO**: Server-side rendering and meta tag optimization

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
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_APP_ENV=development
   NEXT_PUBLIC_ENABLE_MSW=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## 🏗️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run e2e          # Run E2E tests
npm run e2e:ui       # Run E2E tests with UI

# Storybook
npm run storybook    # Start Storybook dev server
npm run build-storybook # Build Storybook

# Formatting
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── providers.tsx   # App providers
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   └── features/      # Feature-specific components
├── hooks/             # Custom React hooks
├── services/          # API services
├── store/             # State management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── mocks/             # MSW mock handlers
```

### Component Development

1. **Create a new component**
   ```bash
   # Create component file
   touch src/components/ui/NewComponent.tsx
   ```

2. **Add Storybook story**
   ```bash
   # Create story file
   touch src/stories/NewComponent.stories.tsx
   ```

3. **Add tests**
   ```bash
   # Create test file
   touch src/components/ui/__tests__/NewComponent.test.tsx
   ```

### API Integration

1. **Define types** in `src/types/api.ts`
2. **Create service** in `src/services/`
3. **Add MSW handlers** in `src/mocks/handlers.ts`
4. **Use React Query** for data fetching

### State Management

- **Server State**: React Query for caching, synchronization, and background updates
- **Client State**: Zustand for local state management
- **Form State**: React Hook Form with Zod validation

## 🧪 Testing

### Unit Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Testing

```bash
# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Debug E2E tests
npx playwright test --debug
```

### Testing Guidelines

- Write tests for all business logic
- Test user interactions, not implementation details
- Use MSW for API mocking
- Maintain >70% code coverage
- Include accessibility tests

## 🎨 Styling

### Tailwind CSS

- **Design System**: Consistent colors, spacing, and typography
- **Responsive**: Mobile-first approach
- **Dark Mode**: Built-in dark mode support
- **Custom Components**: Reusable component patterns

### Design Tokens

Customize the design system in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          // ... more colors
        },
      },
    },
  },
};
```

## 📱 Responsive Design

### Breakpoints

- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach

```jsx
// Example responsive component
<div className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
  {/* Content */}
</div>
```

## ♿ Accessibility

### Guidelines

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation
- Maintain color contrast ratios
- Include ARIA labels and descriptions
- Test with screen readers

### Testing Accessibility

```bash
# Run accessibility tests
npm run test -- --testNamePattern="accessibility"

# Use axe-core in E2E tests
npx playwright test --grep="accessibility"
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t bookstore-ui .

# Run container
docker run -p 3000:3000 bookstore-ui

# Using docker-compose
docker-compose up -d
```

### Environment Variables

#### Required

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_ENV`: Application environment

#### Optional

- `NEXT_PUBLIC_ENABLE_MSW`: Enable API mocking
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry error tracking

## 🔧 Configuration

### Next.js Configuration

Customize `next.config.js` for:

- Image optimization
- Security headers
- API rewrites
- Bundle analysis

### TypeScript Configuration

The project uses strict TypeScript configuration:

- Strict mode enabled
- Path mapping configured
- Exact optional property types

### ESLint Configuration

Extended ESLint configuration includes:

- Next.js recommended rules
- TypeScript rules
- React hooks rules
- Accessibility rules

## 📊 Performance

### Optimization Strategies

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Caching**: React Query with stale-while-revalidate
- **Lazy Loading**: Dynamic imports for heavy components

### Monitoring

- **Core Web Vitals**: Lighthouse CI integration
- **Performance Budget**: Bundle size limits
- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics 4

## 🔒 Security

### Security Measures

- **CSP Headers**: Content Security Policy
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based authentication
- **Secure Cookies**: HttpOnly and Secure flags
- **Dependency Scanning**: npm audit and Snyk

### Authentication

- JWT-based authentication
- Automatic token refresh
- Secure token storage
- Role-based access control

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Type Errors**
   ```bash
   # Run type checking
   npm run type-check
   ```

3. **Test Failures**
   ```bash
   # Clear Jest cache
   npm test -- --clearCache
   ```

4. **MSW Issues**
   ```bash
   # Restart development server
   npm run dev
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Debug specific modules
DEBUG=api:* npm run dev
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Storybook Documentation](https://storybook.js.org/docs)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- Follow TypeScript strict mode
- Use Prettier for formatting
- Write meaningful commit messages
- Include tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide

---

**Happy coding! 🎉**
