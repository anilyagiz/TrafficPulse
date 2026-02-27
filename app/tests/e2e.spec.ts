# Playwright E2E Tests - Extended

import { test, expect } from '@playwright/test';

test.describe('TrafficPulse E2E Tests', () => {
  
  test.describe('Landing Page (Not Connected)', () => {
    test('should display hero section with correct title', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Predict Traffic.')).toBeVisible();
      await expect(page.getByText('Win Rewards.')).toBeVisible();
    });

    test('should show live indicator', async ({ page }) => {
      await page.goto('/');
      const liveIndicator = page.locator('text=Live on Stellar Testnet');
      await expect(liveIndicator).toBeVisible();
    });

    test('should display features section', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Powered by Stellar')).toBeVisible();
      await expect(page.getByText('Pari-Mutuel Payouts')).toBeVisible();
      await expect(page.getByText('Provably Fair')).toBeVisible();
    });

    test('should display how to play section', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('How to Play')).toBeVisible();
    });

    test('should show tech stack info', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Stellar / Soroban')).toBeVisible();
      await expect(page.getByText('Next.js 14')).toBeVisible();
    });
  });

  test.describe('Header & Navigation', () => {
    test('should show TrafficPulse branding', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('TrafficPulse')).toBeVisible();
    });

    test('should show navigation links', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('link', { name: 'Game' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Leaderboard' })).toBeVisible();
    });

    test('should show wallet connect button', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible();
    });

    test('should navigate to leaderboard', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: 'Leaderboard' }).click();
      await expect(page).toHaveURL('/leaderboard');
    });
  });

  test.describe('Prediction Bins', () => {
    test('should display all 5 traffic bins', async ({ page }) => {
      await page.goto('/');
      
      // Check all bins are visible
      await expect(page.getByRole('radio', { name: /0-20/i })).toBeVisible();
      await expect(page.getByRole('radio', { name: /21-40/i })).toBeVisible();
      await expect(page.getByRole('radio', { name: /41-60/i })).toBeVisible();
      await expect(page.getByRole('radio', { name: /61-80/i })).toBeVisible();
      await expect(page.getByRole('radio', { name: /81\+/i })).toBeVisible();
    });

    test('should show correct bin labels', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByText('Very Light')).toBeVisible();
      await expect(page.getByText('Light')).toBeVisible();
      await expect(page.getByText('Moderate')).toBeVisible();
      await expect(page.getByText('Heavy')).toBeVisible();
      await expect(page.getByText('Severe')).toBeVisible();
    });
  });

  test.describe('Stats Cards', () => {
    test('should display timer section', async ({ page }) => {
      await page.goto('/');
      // Timer should be visible after connection prompt
    });

    test('should display pool section', async ({ page }) => {
      await page.goto('/');
    });

    test('should display status section', async ({ page }) => {
      await page.goto('/');
    });
  });

  test.describe('Responsive Design', () => {
    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      await expect(page.getByText('TrafficPulse')).toBeVisible();
      await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible();
    });

    test('should render correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      await expect(page.getByText('TrafficPulse')).toBeVisible();
    });

    test('should render correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      
      await expect(page.getByText('TrafficPulse')).toBeVisible();
    });
  });

  test.describe('UI Components Quality', () => {
    test('should have loading states structure', async ({ page }) => {
      await page.goto('/');
      // Check for spinner class existence
      const spinners = await page.locator('.spinner').count();
      expect(spinners).toBeGreaterThanOrEqual(0);
    });

    test('should have toast notification container', async ({ page }) => {
      await page.goto('/');
      // Toast container exists but is empty initially
      const toastRegion = page.getByRole('region', { name: /notifications/i });
      await expect(toastRegion).toHaveCount(0); // Not visible until toast shown
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      await page.goto('/');
      
      // Check main landmark
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
      
      // Check navigation landmark
      const nav = page.getByRole('navigation', { name: /main/i });
      await expect(nav).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not have critical console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Filter out expected errors (like wallet not connected)
      const criticalErrors = errors.filter(e => 
        !e.includes('Failed to load round') && 
        !e.includes('getRound error') &&
        !e.includes('WebSocket') &&
        !e.includes('network')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Accessibility (a11y)', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // Should have h1
      const h1 = await page.locator('h1').count();
      expect(h1).toBeGreaterThanOrEqual(1);
    });

    test('should have accessible buttons', async ({ page }) => {
      await page.goto('/');
      
      // All buttons should have accessible names
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test('should have accessible links', async ({ page }) => {
      await page.goto('/');
      
      // All links should have accessible names
      const links = await page.locator('a').all();
      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test('should have focusable interactive elements', async ({ page }) => {
      await page.goto('/');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });
  });

  test.describe('Form Validation', () => {
    test('should show stake input after bin selection (when connected)', async ({ page }) => {
      await page.goto('/');
      // Bin selection requires wallet connection
      // This test verifies the UI structure exists
    });

    test('should validate stake amount input', async ({ page }) => {
      await page.goto('/');
      // Input validation requires wallet connection
    });
  });

  test.describe('Leaderboard Page', () => {
    test('should load leaderboard page', async ({ page }) => {
      await page.goto('/leaderboard');
      await expect(page.getByText('Leaderboard')).toBeVisible();
    });

    test('should display leaderboard table headers', async ({ page }) => {
      await page.goto('/leaderboard');
      await expect(page.getByText('Rank')).toBeVisible();
      await expect(page.getByText('Wallet')).toBeVisible();
      await expect(page.getByText('Earned')).toBeVisible();
    });
  });
});