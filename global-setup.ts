import { chromium } from '@playwright/test';
export const AUTH_FILE = "auth.json";

async function globalSetup() {
  console.log('🔐 Rodando global setup...');
  const browser = await chromium.launch({ headless: false }); // ← headless: false para ver o que acontece
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto("https://localhost/Login");
  await page.getByPlaceholder("Email").fill("ney@gmail.com");
  await page.getByPlaceholder("Senha").fill("neymar");
  await page.getByRole("button", { name: /confirmar/i }).click();

  // Aguarda sair da página de Login (redireciona para qualquer outra rota)
  await page.waitForURL((url) => !url.pathname.includes("Login"), {
    timeout: 10_000,
  });

  await context.storageState({ path: AUTH_FILE });
  console.log('✅ auth.json salvo!');
  await browser.close();
}

export default globalSetup;