import { test, expect, request } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5000/');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'login' }).click();
  await page.getByLabel('Username or email').click();
  await page.getByLabel('Username or email').fill('user1');
  await page.getByLabel('Username or email').press('Tab');
  await page.getByLabel('Password').fill('pwd');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Get user resource' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Get admin resource' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Get m2m resource as \'user\'' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Get m2m resource as \'admin\'' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Get m2m resource using \'' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'clear' }).first().click();
  await page.getByRole('button', { name: 'Get resource using a \'service' }).click();
  await page.getByRole('button', { name: 'clear' }).nth(1).click();
});

