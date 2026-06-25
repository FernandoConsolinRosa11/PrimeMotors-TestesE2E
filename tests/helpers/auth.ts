import { expect, Page } from "@playwright/test";

export async function realizarLogin(page: Page) {
  await page.goto("https://localhost/Login");

  await page.fill('input[type="email"]', "aitom@gmail.com");
  await page.fill('input[type="password"]', "123456");

  await page.getByText("Confirmar").click();

  await expect(
    page.getByText(/olá,/i)
  ).toBeVisible();
}

export async function acessarPerfil(page: Page) {
  await page.getByRole("link", {
    name: /olá,/i,
  }).click();

  await expect(page).toHaveURL(
    /\/Perfil\/[0-9a-fA-F-]{36}$/
  );

  await expect(
    page.getByRole("heading", {
      name: /meu perfil/i,
    })
  ).toBeVisible();

  await page.getByRole("button", {
    name: /trocar foto/i,
  }).click();

  await expect(
    page.getByText(/atualizar foto/i)
  ).toBeVisible();
}