#!/usr/bin/env node

/**
 * Automated test for bet tracking functionality
 * This script tests the entire flow without needing a browser
 */

import { chromium } from 'playwright';

async function testBetTracking() {
  console.log('🚀 Starting automated bet tracking test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Go to home page
    console.log('📍 Step 1: Navigating to homepage...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(2000);

    // Step 2: Check if need to sign in
    console.log('📍 Step 2: Checking authentication...');
    const signInButton = await page.$('text=Вход');

    if (signInButton) {
      console.log('⚠️  Not signed in. Please sign in manually...');
      console.log('Waiting 30 seconds for you to sign in...');
      await page.waitForTimeout(30000);
    } else {
      console.log('✅ Already signed in');
    }

    // Step 3: Go to test page to see current bets
    console.log('\n📍 Step 3: Checking current tracked bets...');
    await page.goto('http://localhost:3001/test-tracking');
    await page.waitForTimeout(2000);

    const beforeData = await page.evaluate(() => {
      const pre = document.querySelector('pre');
      return pre ? JSON.parse(pre.textContent) : null;
    });

    console.log('Current tracked bets:', beforeData?.total || 0);
    console.log('Bets:', JSON.stringify(beforeData?.bets || [], null, 2));

    // Step 4: Go back to home and click a bet
    console.log('\n📍 Step 4: Going to homepage and clicking a bet...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });
    console.log('✅ Table loaded');

    // Find first odds cell with data
    console.log('Looking for clickable odds cell...');

    // Try to find and click an odds cell
    const clicked = await page.evaluate(() => {
      const cells = document.querySelectorAll('.text-xs.space-y-0\\.5');
      for (const cell of cells) {
        const mlValue = cell.querySelector('.font-mono');
        if (mlValue && mlValue.textContent.trim() !== '-') {
          console.log('Found cell with ML value:', mlValue.textContent);
          cell.click();
          return true;
        }
      }
      return false;
    });

    if (!clicked) {
      console.log('❌ Could not find clickable odds cell');
      return;
    }

    console.log('✅ Clicked on odds cell');
    await page.waitForTimeout(2000);

    // Check for toast notification
    const toastText = await page.evaluate(() => {
      const toast = document.querySelector('[data-sonner-toast]');
      return toast ? toast.textContent : null;
    });

    console.log('Toast message:', toastText || 'No toast shown');

    // Step 5: Check if cell turned green
    console.log('\n📍 Step 5: Checking if cell turned green...');
    const hasGreenCell = await page.evaluate(() => {
      const greenCells = document.querySelectorAll('.bet-tracked');
      console.log('Green cells found:', greenCells.length);
      return greenCells.length > 0;
    });

    if (hasGreenCell) {
      console.log('✅ SUCCESS: Cell turned green!');
    } else {
      console.log('❌ FAIL: Cell did not turn green');
    }

    // Step 6: Go back to test page to verify
    console.log('\n📍 Step 6: Verifying bet was saved...');
    await page.goto('http://localhost:3001/test-tracking');
    await page.waitForTimeout(2000);

    const afterData = await page.evaluate(() => {
      const pre = document.querySelector('pre');
      return pre ? JSON.parse(pre.textContent) : null;
    });

    console.log('Tracked bets after click:', afterData?.total || 0);

    if (afterData && afterData.total > (beforeData?.total || 0)) {
      console.log('✅ SUCCESS: Bet was saved to database!');
      console.log('New bet:', JSON.stringify(afterData.bets[0], null, 2));
    } else {
      console.log('❌ FAIL: Bet was not saved to database');
    }

    // Step 7: Test untrack by clicking again
    console.log('\n📍 Step 7: Testing untrack (click again)...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    const clickedAgain = await page.evaluate(() => {
      const greenCell = document.querySelector('.bet-tracked');
      if (greenCell) {
        console.log('Found green cell, clicking to untrack...');
        greenCell.click();
        return true;
      }
      return false;
    });

    if (clickedAgain) {
      console.log('✅ Clicked on green cell to untrack');
      await page.waitForTimeout(2000);

      const toastText2 = await page.evaluate(() => {
        const toast = document.querySelector('[data-sonner-toast]');
        return toast ? toast.textContent : null;
      });

      console.log('Toast message:', toastText2 || 'No toast shown');

      // Check if cell is no longer green
      const stillGreen = await page.evaluate(() => {
        const greenCells = document.querySelectorAll('.bet-tracked');
        return greenCells.length > 0;
      });

      if (!stillGreen) {
        console.log('✅ SUCCESS: Cell is no longer green (bet untracked)');
      } else {
        console.log('❌ FAIL: Cell is still green');
      }
    } else {
      console.log('⚠️  No green cell found to untrack');
    }

    console.log('\n✅ Test completed!');
    console.log('Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Check if playwright is installed
try {
  testBetTracking();
} catch (error) {
  console.error('❌ Error: Playwright not installed');
  console.log('Install with: npm install -D playwright');
  process.exit(1);
}
