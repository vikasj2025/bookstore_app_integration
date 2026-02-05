import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Start a browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if the development server is running
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    
    console.log(`🔍 Checking if server is running at ${baseURL}`);
    
    // Wait for the server to be ready
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
        if (response && response.ok()) {
          console.log('✅ Server is ready!');
          break;
        }
      } catch (error) {
        console.log(`⏳ Waiting for server... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
      }
    }
    
    if (retries === 0) {
      throw new Error(`❌ Server at ${baseURL} is not responding after 60 seconds`);
    }
    
    // Set up test data or authentication if needed
    console.log('🔧 Setting up test environment...');
    
    // Mock API endpoints for testing
    await page.route('**/api/v1/**', async route => {
      const url = route.request().url();
      
      // Default mock responses for common endpoints
      if (url.includes('/monitoring/health')) {
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
      } else {
        // Continue with actual request for other endpoints
        await route.continue();
      }
    });
    
    console.log('✅ Global setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
