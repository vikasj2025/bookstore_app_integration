/**
 * Home Page Component
 * Main landing page for the Online Bookstore
 */

import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBooks } from '@/components/home/FeaturedBooks';
import { CategorySection } from '@/components/home/CategorySection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover your next favorite book at our online bookstore. Browse thousands of titles across all genres.',
};

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Books */}
      <section className="container-custom">
        <FeaturedBooks />
      </section>
      
      {/* Categories */}
      <section className="bg-secondary-50 section-padding">
        <div className="container-custom">
          <CategorySection />
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="container-custom">
        <NewsletterSection />
      </section>
    </div>
  );
}
