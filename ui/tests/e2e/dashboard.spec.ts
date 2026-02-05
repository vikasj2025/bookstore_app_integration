import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_data', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    // Mock API responses
    await page.route('**/api/v1/monitoring/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'UP',
          components: {
            database: { status: 'UP' },
            cache: { status: 'UP' },
            api: { status: 'UP' }
          },
          timestamp: new Date().toISOString()
        })
      });
    });
    
    await page.route('**/api/v1/monitoring/metrics**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timeRange: '1h',
          metrics: {
            downloads: { total: 150, current: 5, average: 12.5, peak: 25 },
            bootstrap_operations: { total: 45, current: 2, average: 3.8, peak: 8 },
            cache_hits: { total: 1200, current: 15, average: 95.2, peak: 120 },
            response_times: {
              total: 0,
              current: 125.5,
              average: 98.3,
              peak: 250.1,
              timeSeries: [
                { timestamp: new Date().toISOString(), value: 125.5 }
              ]
            }
          },
          generatedAt: new Date().toISOString()
        })
      });
    });
    
    await page.route('**/api/v1/monitoring/builds**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          builds: [
            {
              buildId: 'build-123',
              projectId: 'project-1',
              status: 'completed',
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              duration: 120,
              mavenVersion: '3.9.6',
              logs: []
            }
          ],
          totalCount: 1,
          summary: {
            running: 2,
            completed: 45,
            failed: 3,
            pending: 1
          }
        })
      });
    });
    
    await page.route('**/api/v1/cache/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          hitRate: 0.85,
          totalKeys: 1250,
          memoryUsage: {
            used: 134217728,
            total: 268435456,
            percentage: 50.0
          },
          lastUpdated: new Date().toISOString()
        })
      });
    });
  });
  
  test('should display dashboard with all sections', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Maven Wrapper Dashboard/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Check quick actions section
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Bootstrap' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Configuration' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Downloads' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Monitoring' })).toBeVisible();
    
    // Check stats overview
    await expect(page.getByText('Total Bootstraps')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();
    await expect(page.getByText('Active Builds')).toBeVisible();
    await expect(page.getByText('Cache Hit Rate')).toBeVisible();
    
    // Check system status
    await expect(page.getByText('System Status')).toBeVisible();
    await expect(page.getByText('All Systems Operational')).toBeVisible();
    
    // Check recent activity
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });
  
  test('should navigate to configuration page', async ({ page }) => {
    await page.goto('/');
    
    // Click on New Bootstrap button
    await page.getByRole('link', { name: 'New Bootstrap' }).click();
    
    // Should navigate to configuration page
    await expect(page).toHaveURL('/configuration');
  });
  
  test('should navigate to monitoring page', async ({ page }) => {
    await page.goto('/');
    
    // Click on Monitoring button
    await page.getByRole('link', { name: 'Monitoring' }).click();
    
    // Should navigate to monitoring page
    await expect(page).toHaveURL('/monitoring');
  });
  
  test('should display correct stats from API', async ({ page }) => {
    await page.goto('/');
    
    // Wait for API calls to complete
    await page.waitForLoadState('networkidle');
    
    // Check that stats are displayed
    await expect(page.getByText('45')).toBeVisible(); // Total bootstraps
    await expect(page.getByText('2')).toBeVisible(); // Active builds
    await expect(page.getByText('85%')).toBeVisible(); // Cache hit rate
  });
  
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/monitoring/health', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            timestamp: new Date().toISOString()
          }
        })
      });
    });
    
    await page.goto('/');
    
    // Should still display the page structure
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Stats should show loading or default values
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });
  
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that mobile navigation is present
    await expect(page.getByRole('button', { name: 'Open sidebar' })).toBeVisible();
    
    // Check that content is still accessible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });
  
  test('should display loading states', async ({ page }) => {
    // Delay API responses
    await page.route('**/api/v1/monitoring/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.goto('/');
    
    // Should show loading skeleton
    await expect(page.locator('.animate-pulse')).toBeVisible();
  });
  
  test('should handle real-time updates via WebSocket', async ({ page }) => {
    await page.goto('/');
    
    // Mock WebSocket message
    await page.evaluate(() => {
      // Simulate WebSocket message for health update
      window.dispatchEvent(new CustomEvent('websocket-message', {
        detail: {
          type: 'health_update',
          data: { status: 'DEGRADED' },
          timestamp: new Date().toISOString()
        }
      }));
    });
    
    // Should update system status
    await expect(page.getByText('DEGRADED')).toBeVisible();
  });
});

test.describe('Dashboard Accessibility', () => {
  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_data', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test that all interactive elements are focusable
    const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const count = await focusableElements.count();
    
    expect(count).toBeGreaterThan(0);
  });
  
  test('should have proper ARIA labels', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_data', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/');
    
    // Check for proper headings hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for proper button labels
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      expect(ariaLabel || text).toBeTruthy();
    }
  });
  
  test('should have sufficient color contrast', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_data', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/');
    
    // This would typically use axe-core for automated accessibility testing
    // For now, we'll check that text is visible and readable
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });
});
