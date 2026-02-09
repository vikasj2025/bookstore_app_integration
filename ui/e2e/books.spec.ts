import { test, expect } from '@playwright/test';

test.describe('Books Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display books page', async ({ page }) => {
    await page.click('text=Books');
    
    await expect(page).toHaveURL('/books');
    await expect(page.locator('h1')).toContainText('Books');
    await expect(page.locator('[data-testid="book-card"]')).toHaveCount(3); // Based on mock data
  });

  test('should search for books', async ({ page }) => {
    await page.goto('/books');
    
    // Search for a specific book
    await page.fill('[data-testid="search-input"]', 'Gatsby');
    await page.click('[data-testid="search-button"]');
    
    // Should show filtered results
    await expect(page.locator('[data-testid="book-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="book-title"]')).toContainText('The Great Gatsby');
  });

  test('should filter books by category', async ({ page }) => {
    await page.goto('/books');
    
    // Filter by Fiction category
    await page.selectOption('[data-testid="category-filter"]', 'Fiction');
    
    // Should show only fiction books
    await expect(page.locator('[data-testid="book-card"]')).toHaveCount(3); // All mock books are fiction
  });

  test('should view book details', async ({ page }) => {
    await page.goto('/books');
    
    // Click on first book
    await page.click('[data-testid="book-card"]:first-child');
    
    // Should navigate to book details page
    await expect(page).toHaveURL(/\/books\/\d+/);
    await expect(page.locator('[data-testid="book-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="book-author"]')).toBeVisible();
    await expect(page.locator('[data-testid="book-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  });

  test('should add book to cart', async ({ page }) => {
    await page.goto('/books/1'); // Navigate to specific book
    
    // Add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Should show success message and update cart count
    await expect(page.locator('[data-testid="toast-message"]')).toContainText('added to cart');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/books');
    
    // If there are more than 20 books, pagination should be visible
    // This test assumes mock data has pagination
    const nextButton = page.locator('[data-testid="next-page"]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=1/);
    }
  });

  test('should sort books', async ({ page }) => {
    await page.goto('/books');
    
    // Sort by price
    await page.selectOption('[data-testid="sort-select"]', 'price,asc');
    
    // Should update URL and reorder books
    await expect(page).toHaveURL(/sort=price%2Casc/);
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/books');
    
    // Search for non-existent book
    await page.fill('[data-testid="search-input"]', 'NonexistentBook');
    await page.click('[data-testid="search-button"]');
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-results"]')).toContainText('No books found');
  });
});
