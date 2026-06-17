import { test, expect } from "@playwright/test";

test.describe("User Login", () => {
  test("Login Realizado Com Sucesso!", async ({ page }) => {
    await page.goto("/Login");

    await page.locator('input[type="email"]').fill("Fernando@gmail.com");
    await page.locator('input[type="password"]').fill("Senha@123");
    await page.click('button[type="submit"]');

    
    await page.goto("/", { timeout: 10000 });
  });

  test("Login Teste Falha! ", async ({ page }) => {
    await page.goto("/Login");

    await page.locator('input[type="email"]').fill("Fernando@gmail");
    await page.locator('input[type="password"]').fill("Senha@123");
    await page.click('button[type="submit"]');

    await page.click('button[type="submit"]');

    
    await expect(page.getByText('Email inválido', { exact: true })).toBeVisible();
  });

});
