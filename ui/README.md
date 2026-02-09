# Online Bookstore Frontend

A modern, responsive frontend application for an online bookstore built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **User Authentication**: Login, registration, and profile management
- **Book Catalog**: Browse, search, and filter books by various criteria
- **Shopping Cart**: Add, update, and remove items with real-time updates
- **Order Management**: Place orders and track order history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support
- **Performance**: Optimized with code splitting and lazy loading

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Testing**: Jest and React Testing Library

## Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Backend API server running (see backend documentation)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Update the environment variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
NEXT_PUBLIC_APP_NAME=Online Bookstore
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── books/             # Book-related pages
│   ├── cart/              # Shopping cart page
│   ├── orders/            # Order management pages
│   ├── profile/           # User profile pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   └── layout/           # Layout components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── services/             # API services
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Key Components

### Authentication

- **AuthContext**: Manages user authentication state
- **Login/Register Pages**: User authentication forms
- **Protected Routes**: Route protection for authenticated users

### Shopping Cart

- **CartContext**: Manages shopping cart state
- **Cart Page**: View and manage cart items
- **Add to Cart**: Add books to cart from any page

### Book Catalog

- **Book List**: Paginated list of books with filters
- **Book Details**: Individual book information
- **Search**: Full-text search functionality

### User Interface

- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages

## API Integration

The application integrates with a REST API backend. The API client (`src/services/api.ts`) handles:

- Authentication with JWT tokens
- Automatic token refresh
- Error handling and retry logic
- Request/response type safety

### API Endpoints

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/logout`
- **Books**: `/books`, `/books/{id}`, `/books/search`
- **Cart**: `/cart`, `/cart/items`
- **Orders**: `/orders`, `/orders/{id}`
- **User**: `/users/profile`

## State Management

The application uses React Context API for state management:

- **AuthContext**: User authentication state
- **CartContext**: Shopping cart state

State is persisted using cookies for authentication tokens and automatically synced with the backend.

## Styling

Tailwind CSS is used for styling with:

- **Design System**: Consistent colors, typography, and spacing
- **Responsive Design**: Mobile-first breakpoints
- **Dark Mode**: Ready for future implementation
- **Custom Components**: Reusable UI components

## Testing

The application includes:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: User flow testing
- **Accessibility Tests**: Automated accessibility checks

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Caching**: API response caching

## Accessibility

The application follows WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: Meets AA contrast requirements
- **Focus Management**: Visible focus indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
# Build Docker image
docker build -t bookstore-ui .

# Run container
docker run -p 3000:3000 bookstore-ui
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure accessibility compliance
5. Test on multiple devices and browsers

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` in environment variables
   - Check if backend server is running
   - Verify CORS configuration on backend

2. **Authentication Issues**
   - Clear browser cookies and localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **Build Issues**
   - Clear Next.js cache: `rm -rf .next`
   - Update dependencies: `npm update`
   - Check TypeScript errors: `npm run type-check`

### Development Tips

- Use React Developer Tools for debugging
- Enable verbose logging in development
- Use browser network tab to debug API calls
- Test with different screen sizes and devices

## License

This project is licensed under the MIT License - see the LICENSE file for details.
