import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  if (!baseURL) {
    throw new Error('baseURL is not defined in playwright config');
  }

  // Launch browser and create a new page
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    console.log('Waiting for application to be ready...');
    await page.goto(baseURL);
    
    // Wait for the main heading to appear, indicating the app has loaded
    await page.waitForSelector('text=Build Environments', { timeout: 30000 });
    
    console.log('Application is ready!');
  } catch (error) {
    console.error('Failed to verify application readiness:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
