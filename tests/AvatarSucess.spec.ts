/// <reference types="node" />

import { test, expect } from "@playwright/test";
import path from "path";
import { realizarLogin, acessarPerfil } from "./helpers/auth.ts";

test("CRUD Avatar - deve atualizar avatar com sucesso", async ({ page }) => {
  console.log("🚀 Cenário de sucesso");

  await realizarLogin(page);
  await acessarPerfil(page);

  const avatarPath = path.resolve(
    __dirname,
    "./fixtures/avatar.png"
  );

  await page
    .locator('input[type="file"]')
    .setInputFiles(avatarPath);

  await page.getByText("Salvar").click();

  await page.waitForTimeout(8000);

  const avatar = page.locator(
    'img[alt="Foto de perfil"]'
  );

  await expect(avatar).toBeVisible();

  await expect(avatar).toHaveAttribute(
    "src",
    /cloudinary|res\.cloudinary\.com/
  );

  console.log("✅ Avatar atualizado");

  console.log(
    "📷 URL:",
    await avatar.getAttribute("src")
  );
  const removeButton = page.getByRole("button", { name: /remover foto/i });
  await expect(removeButton).toBeVisible();

  await removeButton.click();

  await expect(page.getByText("Sem foto")).toBeVisible();

  await expect(avatar).not.toBeVisible();

  console.log("🗑️ Avatar removido com sucesso");
});