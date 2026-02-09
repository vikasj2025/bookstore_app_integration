import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookOpenIcon, TruckIcon, ShieldCheckIcon, HeartIcon } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <BookOpenIcon className="h-8 w-8" />,
      title: 'Vast Collection',
      description: 'Browse through thousands of books across all genres and categories.',
    },
    {
      icon: <TruckIcon className="h-8 w-8" />,
      title: 'Fast Shipping',
      description: 'Free shipping on orders over $50. Get your books delivered quickly.',
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: 'Secure Shopping',
      description: 'Shop with confidence using our secure payment processing.',
    },
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: 'Customer First',
      description: 'Excellent customer service and easy returns for your satisfaction.',
    },
  ];

  const categories = [
    { name: 'Fiction', count: '2,450+ books', href: '/books?category=fiction' },
    { name: 'Non-Fiction', count: '1,890+ books', href: '/books?category=non-fiction' },
    { name: 'Science', count: '1,230+ books', href: '/books?category=science' },
    { name: 'Biography', count: '890+ books', href: '/books?category=biography' },
    { name: 'Technology', count: '750+ books', href: '/books?category=technology' },
    { name: 'Children', count: '1,560+ books', href: '/books?category=children' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Your Next
              <span className="block text-primary-200">Great Read</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-100">
              Explore thousands of books across all genres. From bestsellers to hidden gems,
              find your perfect book with fast shipping and excellent service.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary-700 hover:bg-gray-50">
                <Link href="/books">Browse Books</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-700"
              >
                <Link href="/categories">Shop by Category</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose Our Bookstore?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              We're committed to providing the best book shopping experience
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Find books in your favorite genres
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {category.count}
                    </p>
                  </div>
                  <div className="text-primary-600 dark:text-primary-400">
                    <BookOpenIcon className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/categories">View All Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary-700">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Stay Updated with New Releases
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Subscribe to our newsletter and be the first to know about new books,
              exclusive deals, and reading recommendations.
            </p>
            
            <form className="mt-8 sm:flex sm:max-w-md sm:mx-auto">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-white sm:rounded-r-none"
                placeholder="Enter your email"
              />
              <div className="mt-3 sm:ml-0 sm:mt-0 sm:flex-shrink-0">
                <Button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-400 sm:rounded-l-none"
                >
                  Subscribe
                </Button>
              </div>
            </form>
            
            <p className="mt-4 text-sm text-primary-200">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                10,000+
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Books Available
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                50,000+
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                99.9%
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Customer Satisfaction
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                24/7
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Customer Support
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
