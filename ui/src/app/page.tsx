import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, ShoppingCart, Users, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our online bookstore. Discover your next great read from our extensive collection.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-brand-600" />
              <span className="text-xl font-bold text-neutral-900">Online Bookstore</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/books" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Browse Books
              </Link>
              <Link href="/categories" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                About
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Shopping Cart</span>
                </Link>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 to-brand-100 section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Discover Your Next
              <span className="text-brand-600 block">Great Read</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Explore thousands of books across all genres. From bestsellers to hidden gems, 
              find your perfect book and have it delivered right to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/books">Browse Books</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/categories">Explore Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Our Bookstore?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We're committed to providing the best book shopping experience with 
              exceptional service and unbeatable selection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover">
              <CardHeader>
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-brand-600" />
                </div>
                <CardTitle>Vast Selection</CardTitle>
                <CardDescription>
                  Over 100,000 books across all genres, from classics to the latest releases.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover">
              <CardHeader>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-6 w-6 text-success-600" />
                </div>
                <CardTitle>Fast Delivery</CardTitle>
                <CardDescription>
                  Free shipping on orders over $50 with delivery in 2-3 business days.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover">
              <CardHeader>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-warning-600" />
                </div>
                <CardTitle>Expert Support</CardTitle>
                <CardDescription>
                  Our book experts are here to help you find exactly what you're looking for.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                Featured Books
              </h2>
              <p className="text-neutral-600">
                Handpicked selections from our curators
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/books">View All</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for featured books */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] bg-neutral-200 rounded-lg mb-4 skeleton" />
                  <h3 className="font-semibold text-neutral-900 mb-1 text-truncate-2">
                    Book Title {i}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">Author Name</p>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= 4 ? 'text-warning-400 fill-current' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600 ml-2">(4.0)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-neutral-900">$19.99</span>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-brand-600">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-brand-100 mb-8">
              Get notified about new releases, special offers, and book recommendations 
              tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
              />
              <Button variant="secondary" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-brand-400" />
                <span className="text-lg font-bold text-white">Online Bookstore</span>
              </div>
              <p className="text-sm">
                Your trusted partner in discovering great books. 
                We're passionate about connecting readers with stories that matter.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/books" className="hover:text-white transition-colors">All Books</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/bestsellers" className="hover:text-white transition-colors">Bestsellers</Link></li>
                <li><Link href="/new-releases" className="hover:text-white transition-colors">New Releases</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Online Bookstore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
