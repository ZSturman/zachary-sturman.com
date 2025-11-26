import { test, expect } from '@playwright/test';

test.describe('Project Details Page', () => {
  const projectId = 'B062E7E0-387F-4D08-B0B6-A75410AACCE1';

  test('should load project details for a valid ID', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    
    // Check for project title
    await expect(page.getByRole('heading', { name: 'ZSDynamics V1.0' })).toBeVisible();
    
    // Check for "Back to Home" link
    await expect(page.getByRole('link', { name: '← Home' })).toBeVisible();
  });

  test('should show error for invalid project ID', async ({ page }) => {
    await page.goto('/projects/invalid-id');
    
    await expect(page.getByText('Project not found.')).toBeVisible();
    await expect(page.getByRole('link', { name: '← Home' })).toBeVisible();
  });
});
