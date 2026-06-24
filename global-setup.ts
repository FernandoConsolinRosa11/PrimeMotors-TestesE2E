import { chromium } from '@playwright/test';

export const AUTH_FILE = "auth.json";

async function globalSetup() {
  console.log('🔐 Rodando global setup...');
  const browser = await chromium.launch({ headless: true }); // ← volta para headless
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto("https://localhost/Login");
  await page.getByPlaceholder("Email").fill("google@gmail.com");
  await page.getByPlaceholder("Senha").fill("google123");
  await page.getByRole("button", { name: /confirmar/i }).click();

  // Aguarda a home carregar verificando elemento que só existe após login
  await page.waitForSelector('text=Olá, google', { timeout: 10000 });

  await context.storageState({ path: AUTH_FILE });
  console.log('✅ auth.json salvo!');
  await browser.close();
}

export default globalSetup;