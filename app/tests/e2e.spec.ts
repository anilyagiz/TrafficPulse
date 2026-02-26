import { test, expect } from '@playwright/test';

test.describe('TrafficPulse E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Landing Page (Not Connected)', () => {
    test('should display hero section with correct title', async ({ page }) => {
      await expect(page.getByText('Predict Traffic.')).toBeVisible();
      await expect(page.getByText('Win Rewards.')).toBeVisible();
    });

    test('should display live indicator', async ({ page }) => {
      await expect(page.getByText('Live on Stellar Testnet')).toBeVisible();
    });

    test('should display features section', async ({ page }) => {
      await expect(page.getByText('Commit-Reveal')).toBeVisible();
      await expect(page.getByText('2/3 Multi-Sig')).toBeVisible();
      await expect(page.getByText('Sniping Prevention')).toBeVisible();
      await expect(page.getByText('Pari-Mutuel')).toBeVisible();
    });

    test('should display how to play section', async ({ page }) => {
      await expect(page.getByText('How to Play')).toBeVisible();
      await expect(page.getByText('Connect')).toBeVisible();
      await expect(page.getByText('Predict')).toBeVisible();
      await expect(page.getByText('Stake')).toBeVisible();
      await expect(page.getByText('Wait')).toBeVisible();
      await expect(page.getByText('Win')).toBeVisible();
    });

    test('should display tech stack info', async ({ page }) => {
      await expect(page.getByText('Stellar / Soroban')).toBeVisible();
      await expect(page.getByText('Next.js 14')).toBeVisible();
      await expect(page.getByText('Rust Smart Contracts')).toBeVisible();
      await expect(page.getByText('Freighter Wallet')).toBeVisible();
    });
  });

  test.describe('Header & Navigation', () => {
    test('should display TrafficPulse branding', async ({ page }) => {
      await expect(page.getByText('TrafficPulse')).toBeVisible();
      await expect(page.getByText('Predict Traffic • Win PULSE')).toBeVisible();
    });

    test('should have navigation links', async ({ page }) => {
      await expect(page.getByText('Game')).toBeVisible();
      await expect(page.getByText('Leaderboard')).toBeVisible();
    });

    test('should have wallet connect button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /connect/i })).toBeVisible();
    });
  });

  test.describe('Prediction Bins', () => {
    test('should display all 5 traffic bins', async ({ page }) => {
      const bins = ['0-20', '21-40', '41-60', '61-80', '81+'];
      for (const bin of bins) {
        await expect(page.getByText(bin)).toBeVisible();
      }
    });

    test('should display bin labels', async ({ page }) => {
      await expect(page.getByText('Very Light')).toBeVisible();
      await expect(page.getByText('Light')).toBeVisible();
      await expect(page.getByText('Moderate')).toBeVisible();
      await expect(page.getByText('Heavy')).toBeVisible();
      await expect(page.getByText('Severe')).toBeVisible();
    });
  });

  test.describe('Stats Cards', () => {
    test('should display timer section', async ({ page }) => {
      await expect(page.getByText('Round Ends In')).toBeVisible();
    });

    test('should display pool section', async ({ page }) => {
      await expect(page.getByText('Total Pool')).toBeVisible();
      await expect(page.getByText('PULSE')).toBeVisible();
    });

    test('should display status section', async ({ page }) => {
      await expect(page.getByText('Round Status')).toBeVisible();
    });
  });

  test.describe('Demo Video Section', () => {
    test('should display demo video placeholder', async ({ page }) => {
      await expect(page.getByText('Project Demo')).toBeVisible();
      await expect(page.getByText('Watch Demo Video')).toBeVisible();
    });
  });

  test.describe('Footer', () => {
    test('should display footer links', async ({ page }) => {
      await expect(page.getByText('Explorer')).toBeVisible();
      await expect(page.getByText('GitHub')).toBeVisible();
    });

    test('should display contract info', async ({ page }) => {
      await expect(page.getByText('Powered by Stellar / Soroban')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.getByText('Predict Traffic.')).toBeVisible();
      await expect(page.getByText('Win Rewards.')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.getByText('Predict Traffic.')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.getByText('Predict Traffic.')).toBeVisible();
    });
  });

  test.describe('UI Components Quality', () => {
    test('should have proper loading states structure', async ({ page }) => {
      // Check that loading-related elements exist in the DOM
      const pageContent = await page.content();
      expect(pageContent).toContain('loading');
    });

    test('should have toast notification container', async ({ page }) => {
      // Toast container should be present in the DOM
      const pageContent = await page.content();
      expect(pageContent).toContain('toast');
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      // Check for semantic HTML
      const mainElement = page.locator('main');
      await expect(mainElement).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load page within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have no console errors on load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Filter out expected errors (like network failures for mock data)
      const criticalErrors = errors.filter(e => !e.includes('Failed to load round'));
      expect(criticalErrors.length).toBe(0);
    });
  });
});
