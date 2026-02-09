'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, TrendingUp, BookOpen, Users, Award } from 'lucide-react';
import { Book } from '@/types/api';
import apiClient from '@/services/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

const HomePage: React.FC = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await apiClient.getBooks({ size: 8, sortBy: 'rating', sortDirection: 'desc' });
        setFeaturedBooks(response.content);
      } catch (error) {
        console.error('Failed to fetch featured books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-warning-400 fill-current' : 'text-secondary-300'}
      />
    ));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your Next
              <span className="block text-primary-200">Great Read</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Explore thousands of books across all genres. From bestsellers to hidden gems,
              find the perfect book for every mood and moment.
            </p>
            
            {/* Hero Search */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search for books, authors, or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search size={20} />}
                    className="bg-white text-secondary-900"
                  />
                </div>
                <Button type="submit" variant="secondary" size="lg">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-secondary-900">10,000+</h3>
              <p className="text-secondary-600">Books Available</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-3xl font-bold text-secondary-900">50,000+</h3>
              <p className="text-secondary-600">Happy Customers</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-warning-600" />
              </div>
              <h3 className="text-3xl font-bold text-secondary-900">4.8/5</h3>
              <p className="text-secondary-600">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h2 className="text-3xl font-bold text-secondary-900">Featured Books</h2>
            </div>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Discover our handpicked selection of top-rated books across various genres
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-80">
                  <div className="animate-pulse">
                    <div className="h-48 bg-secondary-200 rounded mb-4"></div>
                    <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-3 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <Card key={book.id} className="group cursor-pointer" hover>
                  <Link href={`/books/${book.id}`}>
                    <div className="aspect-[3/4] bg-secondary-100 rounded-lg mb-4 overflow-hidden">
                      {book.imageUrl ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-secondary-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-1 text-truncate-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-2">{book.author}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(book.rating)}
                      <span className="text-sm text-secondary-500 ml-1">
                        ({book.reviewCount || 0})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(book.price)}
                      </span>
                      {book.inStock ? (
                        <span className="badge badge-success">In Stock</span>
                      ) : (
                        <span className="badge badge-error">Out of Stock</span>
                      )}
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/books">
              <Button size="lg">
                View All Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Find books in your favorite genres and discover new interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Fiction', emoji: '📚', color: 'bg-primary-100 text-primary-700' },
              { name: 'Non-Fiction', emoji: '📖', color: 'bg-success-100 text-success-700' },
              { name: 'Mystery', emoji: '🔍', color: 'bg-purple-100 text-purple-700' },
              { name: 'Romance', emoji: '💕', color: 'bg-pink-100 text-pink-700' },
              { name: 'Sci-Fi', emoji: '🚀', color: 'bg-blue-100 text-blue-700' },
              { name: 'Biography', emoji: '👤', color: 'bg-orange-100 text-orange-700' },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/books?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <Card className={`text-center p-6 ${category.color} border-none group-hover:scale-105 transition-transform duration-200`}>
                  <div className="text-3xl mb-2">{category.emoji}</div>
                  <h3 className="font-semibold">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-secondary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-secondary-300 mb-8">
            Subscribe to our newsletter and never miss new releases, special offers, and book recommendations.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white text-secondary-900"
              required
            />
            <Button type="submit" variant="primary" size="lg">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
