import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Login');
    
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Register');
    
    await expect(page).toHaveURL('/auth/register');
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to home page and show user name
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('John');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Login');
    
    // Fill login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should register successfully', async ({ page }) => {
    // Navigate to register page
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Register');
    
    // Fill registration form
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[type="email"]', 'jane.smith@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to home page and show user name
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Jane');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Login');
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('John');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    // Should show login option again
    await page.click('[data-testid="user-menu"]');
    await expect(page.locator('text=Login')).toBeVisible();
  });
});
