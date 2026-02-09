# Online Bookstore Frontend

A modern, responsive web application for browsing and purchasing books online. Built with Next.js 14, TypeScript, Tailwind CSS, and a comprehensive set of modern web technologies.

## 🚀 Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Authentication**: JWT-based authentication with refresh tokens
- **State Management**: Zustand for client state, React Query for server state
- **Shopping Cart**: Persistent cart with local storage fallback
- **Book Catalog**: Search, filter, and browse books with pagination
- **Order Management**: Complete order flow from cart to checkout
- **Responsive Design**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Performance**: Optimized with code splitting and lazy loading
- **Testing**: Comprehensive test suite with Jest and Playwright
- **Development Tools**: ESLint, Prettier, Storybook

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Backend API server running (see API configuration below)

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

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/v1
   NEXT_PUBLIC_APP_ENV=development
   NEXT_PUBLIC_ENABLE_MSW=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

### Storybook
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

### Code Quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── books/             # Book catalog pages
│   ├── cart/              # Shopping cart page
│   ├── orders/            # Order management pages
│   └── profile/           # User profile pages
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── features/          # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   └── container.ts       # Dependency injection container
├── services/              # API services and business logic
│   ├── api/               # API client
│   ├── auth.ts            # Authentication service
│   ├── book.ts            # Book service
│   ├── cart.ts            # Cart service
│   └── order.ts           # Order service
├── store/                 # State management (Zustand stores)
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── config/                # Configuration files
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/v1

# Optional
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_MSW=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

### API Configuration

The application expects a REST API server running at the configured base URL. The API should implement the endpoints defined in the OpenAPI specification.

### Mock Service Worker (MSW)

For development without a backend, enable MSW in your environment:

```env
NEXT_PUBLIC_ENABLE_MSW=true
```

MSW will intercept API calls and return mock data for development and testing.

## 🧪 Testing

### Unit Tests

Run unit tests with Jest and React Testing Library:

```bash
npm run test
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

### Test Coverage

Generate coverage report:

```bash
npm run test:coverage
```

## 📚 Storybook

View and develop components in isolation:

```bash
npm run storybook
```

Storybook will be available at [http://localhost:6006](http://localhost:6006)

## 🚀 Deployment

### Docker

Build and run with Docker:

```bash
# Build image
docker build -t bookstore-ui .

# Run container
docker run -p 3000:3000 bookstore-ui
```

### Vercel

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

### Static Export

For static hosting:

```bash
npm run build
npm run export
```

## 🔍 Key Features

### Authentication
- JWT-based authentication with automatic token refresh
- Protected routes with redirect to login
- User registration and login forms with validation
- Persistent authentication state

### Shopping Cart
- Add/remove items with quantity management
- Persistent cart state (localStorage + server sync)
- Real-time cart updates across components
- Cart summary and checkout flow

### Book Catalog
- Search books by title, author, or description
- Filter by category, price range, and rating
- Sort by various criteria (title, price, rating, date)
- Pagination with configurable page sizes
- Book details with related recommendations

### Order Management
- Complete checkout process with address and payment
- Order history with status tracking
- Order details with item breakdown
- Order cancellation (when applicable)

### User Experience
- Responsive design for all device sizes
- Loading states and error handling
- Toast notifications for user feedback
- Accessibility features (ARIA labels, keyboard navigation)
- Dark mode support (configurable)

## 🛡️ Security

- Content Security Policy (CSP) headers
- XSS protection with sanitized inputs
- CSRF protection for forms
- Secure token storage and management
- Input validation and sanitization

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modals and forms

## 📈 Performance

- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- Lazy loading for non-critical components
- React Query for efficient data fetching and caching
- Bundle analysis and optimization

## 🐛 Debugging

### Development Tools

- React DevTools for component inspection
- React Query DevTools for cache inspection
- Redux DevTools for state debugging (if using Redux)
- Browser DevTools for performance profiling

### Logging

The application includes structured logging:

```typescript
// Enable debug logging
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
```

### Common Issues

1. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_BASE_URL` is correct
   - Check if backend server is running
   - Enable MSW for development without backend

2. **Authentication Issues**
   - Clear localStorage and cookies
   - Check token expiration
   - Verify JWT secret configuration

3. **Build Issues**
   - Clear `.next` folder and rebuild
   - Check for TypeScript errors
   - Verify all environment variables are set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Document complex functions and components
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check existing documentation
- Review the troubleshooting section

## 🗺️ Roadmap

- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Advanced search with filters
- [ ] Wishlist functionality
- [ ] Book reviews and ratings
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Advanced analytics integration
