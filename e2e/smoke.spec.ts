import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[formcontrolname="email"]').fill(email);
  await page.locator('input[formcontrolname="password"]').fill(password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL('**/home', { timeout: 60_000 });
}

test('admin: login -> home -> entrar a un grupo -> tickets -> logout', async ({ page }) => {
  await login(page, 'admin@erp.com', 'admin2026');

  await expect(page.locator('h1')).toContainText('Bienvenido');
  await expect(page.locator('h1')).toContainText('admin');

  const cards = page.locator('p-card');
  const emptyState = page.getByText('No hay grupos disponibles', { exact: false });
  await Promise.race([
    cards.first().waitFor({ state: 'visible', timeout: 60_000 }),
    emptyState.waitFor({ state: 'visible', timeout: 60_000 })
  ]);

  if (await cards.count()) {
    await cards.first().click();
    await page.waitForURL('**/dashboard-group', { timeout: 60_000 });
  }

  await page.goto('/tickets', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/tickets/);

  await page.evaluate(() => localStorage.clear());
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/);
});

test('usuario: login -> home -> logout', async ({ page }) => {
  await login(page, 'ang@gmail.com', 'ang44Tg!');

  await expect(page.locator('h1')).toContainText('Bienvenido');
  await expect(page.locator('h1')).toContainText('ang');

  await page.evaluate(() => localStorage.clear());
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/);
});
