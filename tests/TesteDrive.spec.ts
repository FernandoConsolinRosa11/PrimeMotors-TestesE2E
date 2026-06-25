import { test, expect, Page } from '@playwright/test';
import { AUTH_FILE } from '../global-setup';

const BASE_URL = 'https://localhost';

function getDynamicSchedule() {
  const futureDate = new Date();
  const randomDays = Math.floor(Math.random() * 58) + 2; 
  futureDate.setDate(futureDate.getDate() + randomDays);
  
  const randomMinutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const randomSeconds = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  
  const yyyy = futureDate.getFullYear();
  const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
  const dd = String(futureDate.getDate()).padStart(2, '0');
  
  return {
    datetime: `${yyyy}-${mm}-${dd}T15:${randomMinutes}:${randomSeconds}`,
    observation: `Teste automatizado Playwright - ID ${Math.floor(Math.random() * 90000) + 10000}`,
  };
}

test.use({
  storageState: AUTH_FILE,
  ignoreHTTPSErrors: true,
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function navigateToCarDetails(page: Page): Promise<string | null> {
  await page.goto(`${BASE_URL}/Explorar`);
  await page.waitForLoadState('networkidle');

  // 1. Mira especificamente na tag h6 que contém o nome do carro no primeiro card
  const firstCarTitleLocator = page.locator('h6 span').first();
  await expect(firstCarTitleLocator).toBeVisible({ timeout: 10000 });
  
  // Captura o nome limpo (Ex: "Huracán EVO", "488", etc.)
  const carName = await firstCarTitleLocator.textContent();

  // 2. Clica no botão "Detalhes" do primeiro card
  const detalhesBtn = page.getByRole('button', { name: /detalhes/i }).first();
  await expect(detalhesBtn).toBeVisible({ timeout: 10000 });
  await detalhesBtn.click();
  
  await page.waitForLoadState('networkidle');
  expect(page.url()).toMatch(/\/Explorar\/.+/);
  
  return carName;
}

async function navigateToTestDrive(page: Page) {
  await page.goto(`${BASE_URL}/Menu`);
  await page.waitForLoadState('networkidle');
  await page.getByText(/teste drive/i).first().click();
  await page.waitForLoadState('networkidle');
  expect(page.url()).toMatch(/\/TestDrive\/.+/);
}

async function abrirModalAgendar(page: Page) {
  const btn = page.getByText(/agendar test drive/i).first();
  await expect(btn).toBeVisible({ timeout: 10000 });
  await btn.click();
  await expect(page.locator('input[type="datetime-local"]')).toBeVisible({ timeout: 5000 });
}

// ─────────────────────────────────────────────────────────────────────
// BLOCO 1 — CRUD TEST DRIVE (SUCESSO)
// ─────────────────────────────────────────────────────────────────────

test.describe('✅ Test Drive — CRUD Sucesso', () => {

  test('1.1 — Sessão autenticada está ativa na Home', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/olá,/i)).toBeVisible({ timeout: 10000 });
    expect(page.url()).toBe(`${BASE_URL}/`);
  });

  test('1.2 — CREATE: Agendar Test Drive via /Explorar/:id', async ({ page }) => {
    const schedule = getDynamicSchedule();
    const carName = await navigateToCarDetails(page);
    await abrirModalAgendar(page);

    await page.locator('input[type="datetime-local"]').fill(schedule.datetime);
    await page.locator('textarea').first().fill(schedule.observation);

    const responsePromise = page.waitForResponse(
      res => res.url().includes('test-drives') && res.status() === 201, 
      { timeout: 10000 }
    );

    const confirmBtn = page.getByRole('button', { name: /confirmar agendamento/i });
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();
    } else {
      await page.locator('text=Confirmar Agendamento').click();
    }

    await responsePromise;
    await expect(page.locator('input[type="datetime-local"]')).toBeHidden({ timeout: 8000 });

    await navigateToTestDrive(page);

    // Valida diretamente a página de destino (Sem filtros!)
    await expect(page.getByText(/meu agendamento/i)).toBeVisible({ timeout: 15000 });

    if (carName) {
      const palavra = carName.trim().split(/\s+/)[0];
      await expect(page.getByText(new RegExp(palavra, 'i')).first()).toBeVisible({ timeout: 5000 });
    }

    await expect(page.getByText(/pendente/i).first()).toBeVisible();
  });

  test('1.3 — UPDATE: Editar agendamento (botão "Salvar Alterações")', async ({ page }) => {
    await navigateToTestDrive(page);

    const editBtn = page.getByText(/editar/i).first();
    await expect(editBtn).toBeVisible({ timeout: 10000 });
    await editBtn.click();

    await expect(page.locator('input[type="datetime-local"]')).toBeVisible({ timeout: 5000 });

    const textarea = page.locator('textarea').first();
    await textarea.fill('Observação atualizada pelo Playwright');

    await page.getByText(/salvar alterações/i).first().click();
    await expect(page.locator('input[type="datetime-local"]')).toBeHidden({ timeout: 8000 });
    await expect(page.getByText(/observação atualizada pelo playwright/i)).toBeVisible({ timeout: 5000 });
  });

  test('1.4 — DELETE: Excluir agendamento em /TestDrive/:id', async ({ page }) => {
    await navigateToTestDrive(page);

    const excluirBtns = page.getByText(/excluir/i);
    const countBefore = await excluirBtns.count();
    expect(countBefore).toBeGreaterThan(0);

    page.once('dialog', d => d.accept());

    await excluirBtns.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const countAfter = await page.getByText(/excluir/i).count();
    expect(countAfter).toBeLessThan(countBefore);
  });

});

// ─────────────────────────────────────────────────────────────────────
// BLOCO 2 — CRUD TEST DRIVE (FALHA / VALIDAÇÃO)
// ─────────────────────────────────────────────────────────────────────

test.describe('❌ Test Drive — CRUD Falha e Validação', () => {

  test('2.1 — Confirmar agendamento sem data bloqueia envio', async ({ page }) => {
    await navigateToCarDetails(page);
    await abrirModalAgendar(page);

    await page.getByText(/confirmar agendamento/i).first().click();
    await expect(page.locator('input[type="datetime-local"]')).toBeVisible();

    const isValid = await page.locator('input[type="datetime-local"]')
      .evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('2.2 — Cancelar modal de criação não salva agendamento', async ({ page }) => {
    const schedule = getDynamicSchedule();
    await navigateToCarDetails(page);
    await abrirModalAgendar(page);

    await page.locator('input[type="datetime-local"]').fill(schedule.datetime);
    await page.locator('textarea').first().fill('Texto temporário cancelado');

    await page.getByText(/cancelar/i).first().click();
    await expect(page.locator('input[type="datetime-local"]')).toBeHidden({ timeout: 5000 });

    await navigateToTestDrive(page);
    await expect(page.getByText('Texto temporário cancelado')).toBeHidden();
  });

  test('2.3 — Cancelar modal de edição não salva alteração', async ({ page }) => {
    await navigateToTestDrive(page);

    const editBtn = page.getByText(/editar/i).first();
    await expect(editBtn).toBeVisible({ timeout: 10000 });
    await editBtn.click();

    await expect(page.locator('input[type="datetime-local"]')).toBeVisible({ timeout: 5000 });
    await page.locator('textarea').first().fill('Alteração abortada');

    await page.getByText(/cancelar/i).first().click();
    await expect(page.locator('input[type="datetime-local"]')).toBeHidden({ timeout: 5000 });
    await expect(page.getByText('Alteração abortada')).toBeHidden();
  });

  test('2.4 — Data no passado deve ser bloqueada', async ({ page }) => {
    await navigateToCarDetails(page);
    await abrirModalAgendar(page);

    await page.locator('input[type="datetime-local"]').fill('2020-01-01T08:00');
    await page.getByText(/confirmar agendamento/i).first().click();

    const modalAberto = await page.locator('input[type="datetime-local"]').isVisible();
    const erroVisivel = await page.getByText(/data.*inválid|passado|data.*futura/i)
      .isVisible().catch(() => false);

    expect(modalAberto || erroVisivel).toBe(true);
  });

  test('2.5 — Texto muito longo na observação não trava a UI', async ({ page }) => {
    const schedule = getDynamicSchedule();
    await navigateToCarDetails(page);
    await abrirModalAgendar(page);

    await page.locator('input[type="datetime-local"]').fill(schedule.datetime);
    await page.locator('textarea').first().fill('A'.repeat(1001));

    const valor = await page.locator('textarea').first().inputValue();
    expect(valor.length).toBeGreaterThan(0);

    await page.getByText(/cancelar/i).first().click();
    await expect(page.locator('input[type="datetime-local"]')).toBeHidden({ timeout: 5000 });
  });

});