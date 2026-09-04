import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('显示完整的单页板块与指定文案', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '2048 数字挑战', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: '游戏介绍' })).toBeVisible();
  await expect(page.getByText('4×4 棋盘')).toBeVisible();
  await expect(page.getByText('单步撤销', { exact: true })).toBeVisible();
  await expect(page.getByText('本地保存')).toBeVisible();
  await expect(page.getByRole('heading', { name: '玩法说明' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '开始挑战' })).toBeVisible();
});

test('主题选择可切换并在刷新后恢复', async ({ page }) => {
  const darkButton = page.getByRole('button', { name: '深色' });
  await darkButton.click();
  await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('键盘移动会计分且支持单步撤销', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem('jy-2048:e2e-seeded')) return;
    window.sessionStorage.setItem('jy-2048:e2e-seeded', 'true');
    window.localStorage.setItem(
      'jy-2048:game:v1',
      JSON.stringify({
        board: [
          [2, 2, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        score: 0,
        bestScore: 0,
        previous: null,
        status: 'playing',
      }),
    );
  });
  await page.reload();
  await expect(page.getByRole('gridcell', { name: '第 1 行，第 1 列，2' })).toBeVisible();
  await expect(page.getByRole('gridcell', { name: '第 1 行，第 2 列，2' })).toBeVisible();
  await page.locator('#game').focus();
  await expect(page.locator('#game')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('current-score')).toHaveText('4');
  await page.getByRole('button', { name: '单步撤销' }).click();
  await expect(page.getByTestId('current-score')).toHaveText('0');
});

test('重新开始前要求确认', async ({ page }) => {
  await page.getByRole('button', { name: '重新开始' }).click();
  await expect(page.getByRole('dialog', { name: '重新开始？' })).toBeVisible();
  await page.getByRole('button', { name: '取消' }).click();
  await expect(page.getByRole('dialog', { name: '重新开始？' })).toBeHidden();
});
