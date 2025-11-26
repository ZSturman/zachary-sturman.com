import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the portfolio header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Zachary Sturman' })).toBeVisible();
    await expect(page.getByText('I think a lot about how design influences trust')).toBeVisible();
  });

  test('should load and display projects', async ({ page }) => {
    // Wait for loading to finish (loading text disappears)
    await expect(page.getByText('Loading projects…')).not.toBeVisible();
    
    // Check if at least one project card is visible
    // We check for a known project title from the mock data/json
    await expect(page.getByText('ZSDynamics V1.0')).toBeVisible();
  });

  test('should open project modal when clicking a project', async ({ page }) => {
    await expect(page.getByText('Loading projects…')).not.toBeVisible();
    
    // Click on the project card
    await page.getByText('ZSDynamics V1.0').click();
    
    // Check URL
    await expect(page).toHaveURL(/.*project=B062E7E0-387F-4D08-B0B6-A75410AACCE1/);
    
    // Check if modal is open
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'ZSDynamics V1.0' })).toBeVisible();
  });
});
