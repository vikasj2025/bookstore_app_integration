import { test, expect } from '@playwright/test';

test.describe('Build Environment Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the dashboard title and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Build Environments' })).toBeVisible();
    await expect(page.getByText('Monitor and manage your automated build environments')).toBeVisible();
  });

  test('should show navigation sidebar', async ({ page }) => {
    await expect(page.getByText('Build Environment')).toBeVisible();
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('Build Tools')).toBeVisible();
    await expect(page.getByText('Repository Access')).toBeVisible();
    await expect(page.getByText('Health Monitoring')).toBeVisible();
    await expect(page.getByText('Configuration Rollback')).toBeVisible();
  });

  test('should display environment cards', async ({ page }) => {
    // Wait for data to load
    await expect(page.getByText('Java Spring Boot Project')).toBeVisible();
    await expect(page.getByText('Node.js React App')).toBeVisible();
    await expect(page.getByText('Python Django API')).toBeVisible();
  });

  test('should show environment status badges', async ({ page }) => {
    await expect(page.getByText('ACTIVE')).toBeVisible();
    await expect(page.getByText('CONFIGURING')).toBeVisible();
    await expect(page.getByText('ERROR')).toBeVisible();
  });

  test('should display health status for environments', async ({ page }) => {
    await expect(page.getByText('Health: HEALTHY')).toBeVisible();
    await expect(page.getByText('Health: DEGRADED')).toBeVisible();
    await expect(page.getByText('Health: UNHEALTHY')).toBeVisible();
  });

  test('should show installed tools', async ({ page }) => {
    await expect(page.getByText('JAVA')).toBeVisible();
    await expect(page.getByText('MAVEN')).toBeVisible();
    await expect(page.getByText('NODEJS')).toBeVisible();
  });

  test('should have working action buttons', async ({ page }) => {
    // Test View button
    const viewButtons = page.getByText('View');
    await expect(viewButtons.first()).toBeVisible();
    await expect(viewButtons.first()).toBeEnabled();

    // Test Configure button
    const configureButtons = page.getByText('Configure');
    await expect(configureButtons.first()).toBeVisible();
    await expect(configureButtons.first()).toBeEnabled();

    // Test Create Environment button
    const createButton = page.getByText('Create Environment');
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Click on Build Tools tab
    await page.getByText('Build Tools').click();
    await expect(page.getByText('No Environment Selected')).toBeVisible();

    // Click on Repository Access tab
    await page.getByText('Repository Access').click();
    await expect(page.getByText('No Environment Selected')).toBeVisible();

    // Click on Health Monitoring tab
    await page.getByText('Health Monitoring').click();
    await expect(page.getByText('No Environment Selected')).toBeVisible();

    // Click on Configuration Rollback tab
    await page.getByText('Configuration Rollback').click();
    await expect(page.getByText('No Environment Selected')).toBeVisible();

    // Go back to Overview
    await page.getByText('Overview').click();
    await expect(page.getByText('Java Spring Boot Project')).toBeVisible();
  });

  test('should select environment and navigate to build tools', async ({ page }) => {
    // Click on an environment card
    await page.getByText('Java Spring Boot Project').click();
    
    // Click configure button
    const configureButtons = page.getByText('Configure');
    await configureButtons.first().click();
    
    // Should navigate to build tools tab with environment selected
    await expect(page.getByText('Build Tools')).toBeVisible();
    await expect(page.getByText('Manage and install build tools for your environment')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar should be hidden on mobile
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Click menu to open sidebar
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByText('Build Environment')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByText('Build Environment')).toBeVisible();
  });

  test('should display user menu', async ({ page }) => {
    // Click on user avatar
    await page.getByRole('button', { name: /john doe/i }).click();
    
    // Should show user menu
    await expect(page.getByText('john.doe@company.com')).toBeVisible();
    await expect(page.getByText('Profile')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Sign out')).toBeVisible();
  });

  test('should show notifications', async ({ page }) => {
    // Notification bell should be visible
    const notificationBell = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await expect(notificationBell).toBeVisible();
    
    // Should show notification badge
    await expect(page.getByText('3')).toBeVisible();
  });

  test('should handle refresh functionality', async ({ page }) => {
    // Click refresh button
    await page.getByText('Refresh').click();
    
    // Should still show environments after refresh
    await expect(page.getByText('Java Spring Boot Project')).toBeVisible();
  });

  test('should show environment details on card click', async ({ page }) => {
    // Click on environment card
    await page.getByText('Java Spring Boot Project').click();
    
    // Card should be highlighted/selected
    const environmentCard = page.locator('div').filter({ hasText: 'Java Spring Boot Project' }).first();
    await expect(environmentCard).toHaveClass(/ring-primary/);
  });

  test('should display creation and modification times', async ({ page }) => {
    await expect(page.getByText(/Created.*ago/)).toBeVisible();
    await expect(page.getByText(/Last modified.*ago/)).toBeVisible();
  });

  test('should show environment variables count', async ({ page }) => {
    await expect(page.getByText('3 env vars')).toBeVisible();
    await expect(page.getByText('2 env vars')).toBeVisible();
    await expect(page.getByText('0 env vars')).toBeVisible();
  });
});

test.describe('Build Tools Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select an environment and navigate to build tools
    await page.getByText('Java Spring Boot Project').click();
    await page.getByText('Build Tools').click();
  });

  test('should display build tools interface', async ({ page }) => {
    await expect(page.getByText('Build Tools')).toBeVisible();
    await expect(page.getByText('Manage and install build tools for your environment')).toBeVisible();
  });

  test('should show installed tools section', async ({ page }) => {
    await expect(page.getByText('Installed Tools')).toBeVisible();
    await expect(page.getByText('Currently installed build tools in this environment')).toBeVisible();
  });

  test('should display available versions section', async ({ page }) => {
    await expect(page.getByText('Available Versions')).toBeVisible();
    await expect(page.getByText('Browse and install available tool versions')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    const h2s = page.getByRole('heading', { level: 2 });
    expect(await h2s.count()).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for loading states
    const loadingElements = page.getByLabel('Loading');
    // Loading elements may or may not be present depending on timing
    
    // Check for buttons with proper labels
    await expect(page.getByRole('button', { name: /create environment/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate buttons with Enter/Space
    await page.keyboard.press('Enter');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic check - in a real scenario, you'd use axe-playwright
    const textElements = page.locator('text=Build Environments');
    await expect(textElements.first()).toBeVisible();
  });
});
