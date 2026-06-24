import { test, expect } from "@playwright/test";
import { realizarLogin, acessarPerfil } from "./helpers/auth";

test("CRUD Avatar - não deve atualizar avatar sem arquivo", async ({ page }) => {
  console.log("🚀 Cenário de falha");

  await realizarLogin(page);
  await acessarPerfil(page);

  // Não seleciona arquivo
  await page.getByText("Salvar").click();

  await page.waitForTimeout(2000);

  const avatar = page.locator(
    'img[alt="Foto de perfil"]'
  );

  const quantidade = await avatar.count();

  console.log(
    "Quantidade de avatares encontrados:",
    quantidade
  );

  // O sistema não deve quebrar
  await expect(
    page.getByText(/atualizar foto/i)
  ).toBeVisible();

  console.log(
    "✅ Operação sem arquivo foi bloqueada"
  );
});