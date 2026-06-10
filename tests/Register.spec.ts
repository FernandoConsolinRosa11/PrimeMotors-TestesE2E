import { test, expect } from '@playwright/test';

test.describe('User Register',() => {
  test('Cadastro Realizado Com Sucesso! ', async ({page}) => {
    await page.goto('https://localhost/Register');

    await page.fill('input[name="name"]','Fernando Consolin Rosa');
    await page.fill('input[name="email"]','Fernando@gmail.com');
    await page.fill('input[name="password"]','Senha@123');
    await page.fill('input[name="confirmPassword"]', 'Senha@123');
    await page.fill('input[name="cpf"]','09899631957');
    await page.fill('input[name="cep"]', '01001000');
    await page.fill('input[name="number"]', '(44) 99958-3036');
    await page.getByLabel('Aceito os Termos de Uso e a Política de Privacidade.').check();
    await page.click('button[type="submit"]');

 // Verificar redirecionamento ou mensagem de sucesso
    await page.goto('https://localhost/Login',{ timeout: 10000 });
  } );

  test('Deve falhar com email inválido', async ({ page }) => {
    await page.goto('https://localhost/Register');
    
    await page.fill('input[name="name"]', 'João Silva');
    await page.fill('input[name="email"]', 'joao@gmail');
    await page.fill('input[name="password"]', 'Senha123!');
    await page.fill('input[name="confirmPassword"]', 'Senha123!');
    await page.fill('input[name="cpf"]', '12345678900');
    await page.fill('input[name="cep"]', '01234567');
    await page.fill('input[name="number"]', '(44) 99958-3036');
    await page.getByLabel('Aceito os Termos de Uso e a Política de Privacidade.').check();
    await page.click('button[type="submit"]');
    
    // Verificar erro
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });
})