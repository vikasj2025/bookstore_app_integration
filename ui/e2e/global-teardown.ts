import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Global teardown code here
  console.log('Cleaning up after E2E tests...');
  
  // You can add cleanup logic here, such as:
  // - Stopping additional services
  // - Cleaning up test databases
  // - Removing test files
}

export default globalTeardown;
