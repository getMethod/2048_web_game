import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const key = 'jy-2048:game:v1';
const pair = [
  [2, 2, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
async function seed(
  page: Page,
  board = pair,
  bestScore = 0,
  score = 0,
  status = 'playing',
): Promise<void> {
  await page.evaluate(
    ({ board, bestScore, score, status }) => {
      sessionStorage.setItem(
        'optimization-seed',
        JSON.stringify({ board, bestScore, score, status, previous: null }),
      );
    },
    { board, bestScore, score, status },
  );
  await page.reload();
  await expect(page.getByRole('gridcell')).toHaveText(
    board.flat().map((value) => String(value || '空格')),
  );
  await page.locator('#game').focus();
}
async function saved(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), key);
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    Math.random = () => 0;
    const seed = sessionStorage.getItem('optimization-seed');
    if (seed) {
      localStorage.clear();
      localStorage.setItem('jy-2048:game:v1', seed);
      sessionStorage.removeItem('optimization-seed');
    }
  });
  await page.goto('/');
  await seed(page);
});

test('真实滑动、合并和出生按时间先后出现，最终没有旧块残留', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-06T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-06T00:00:01Z'));
  await page.evaluate(() =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })),
  );
  await page.clock.runFor(32);
  const samples = await page.evaluate(() => {
    const source = document.querySelector<HTMLElement>('[data-path="0-1"]');
    const merged = document.querySelector<HTMLElement>('[data-feedback="merge"]');
    const birth = document.querySelector<HTMLElement>('[data-feedback="birth"]');
    if (!source || !merged || !birth) throw new Error('缺少路径或合并、出生层');
    const animations = source.getAnimations();
    const slide = animations.find(
      (animation) => animation instanceof CSSAnimation && animation.animationName === 'tile-slide',
    );
    if (!slide) throw new Error('缺少真实滑动动画');
    slide.pause();
    slide.currentTime = 0;
    const start = source.getBoundingClientRect().x;
    slide.currentTime = 65;
    const middle = source.getBoundingClientRect().x;
    slide.currentTime = 130;
    const end = source.getBoundingClientRect().x;
    const mergeAnimation = merged.getAnimations()[0];
    const birthAnimation = birth.getAnimations()[0];
    if (!mergeAnimation || !birthAnimation) throw new Error('缺少结果动画');
    mergeAnimation.pause();
    birthAnimation.pause();
    mergeAnimation.currentTime = 60;
    birthAnimation.currentTime = 60;
    const before = [getComputedStyle(merged).opacity, getComputedStyle(birth).opacity];
    mergeAnimation.currentTime = 205;
    birthAnimation.currentTime = 200;
    const after = [getComputedStyle(merged).transform, getComputedStyle(birth).opacity];
    return { start, middle, end, before, after };
  });
  expect(samples.start).toBeGreaterThan(samples.middle);
  expect(samples.middle).toBeGreaterThan(samples.end);
  expect(samples.before).toEqual(['0', '0']);
  expect(samples.after[0]).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  expect(Number(samples.after[1])).toBeGreaterThan(0);
  await page.clock.runFor(500);
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.locator('[data-path]')).toHaveCount(0);
  await expect(page.locator('[aria-hidden="true"] [data-value]')).toHaveCount(2);
  await expect(page.getByRole('gridcell', { name: '第 1 行，第 1 列，4' })).toBeVisible();
  await expect(page.getByTestId('current-score')).toHaveText('4');
  const data = JSON.parse((await saved(page)) ?? '{}');
  expect(Object.keys(data).sort()).toEqual(['bestScore', 'board', 'previous', 'score', 'status']);
});

test('快速连续输入准确计分、无效移动不改存档或撤销', async ({ page }) => {
  await seed(page, [
    [2, 2, 4, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  await page.evaluate(() => {
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'])
      window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
  await expect(page.getByTestId('current-score')).toHaveText('16');
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.locator('[data-path]')).toHaveCount(0);
  await page.getByRole('button', { name: '单步撤销' }).click();
  await expect(page.getByTestId('current-score')).toHaveText('12');
  await seed(page, [
    [2, 4, 8, 16],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const before = await saved(page);
  await page.keyboard.press('ArrowLeft');
  expect(await saved(page)).toBe(before);
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.getByTestId('score-gain')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '单步撤销' })).toBeDisabled();
});

test('动画中撤销、重开和主题切换不留下旧动画或改变状态', async ({ page }) => {
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  });
  await page.getByRole('button', { name: '单步撤销' }).click();
  await expect(page.getByTestId('current-score')).toHaveText('0');
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.getByTestId('score-gain')).toHaveCount(0);
  await expect(page.getByTestId('new-record')).toHaveCount(0);
  await page.keyboard.press('ArrowLeft');
  const state = await saved(page);
  await page.getByRole('button', { name: '深色', exact: true }).click();
  expect(await saved(page)).toBe(state);
  await page.getByRole('button', { name: '重新开始', exact: true }).click();
  await page.getByRole('button', { name: '确认重开' }).click();
  await expect(page.getByTestId('current-score')).toHaveText('0');
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.locator('[data-path]')).toHaveCount(0);
  await expect(page.getByTestId('new-record')).toHaveCount(0);
});

test('纪录严格突破只提示一次，恢复、新局与无得分移动正确', async ({ page }) => {
  await seed(
    page,
    [
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    8,
  );
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('score-gain')).toHaveText('+8');
  await expect(page.getByTestId('new-record')).toHaveCount(0);
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('new-record')).toHaveText('新纪录');
  await expect(page.getByTestId('current-score')).toHaveText('16');
  await page.getByRole('button', { name: '单步撤销' }).click();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('new-record')).toHaveCount(0);
  const state = await saved(page);
  await page.reload();
  expect(await saved(page)).toBe(state);
  await expect(page.getByTestId('score-gain')).toHaveCount(0);
  await expect(page.getByTestId('new-record')).toHaveCount(0);
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('score-gain')).toHaveCount(0);
});

test('演示首次可见播放、离屏停止且键盘重播不影响棋局', async ({ page }) => {
  await page.locator('#how-to-play').scrollIntoViewIfNeeded();
  const demo = page.locator('[data-demo="merge"]');
  await expect(demo).toHaveAttribute('data-run', '1');
  const state = await saved(page);
  const replay = page.getByRole('button', { name: '重播合并数字演示' });
  await replay.focus();
  await page.keyboard.press('Enter');
  await expect(demo).toHaveAttribute('data-run', '2');
  await expect(demo).toHaveAttribute('data-playing', 'true');
  await page.keyboard.press('ArrowLeft');
  expect(await saved(page)).toBe(state);
  await page.locator('#game').scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute('data-playing', 'false');
  await page.locator('#how-to-play').scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute('data-run', '2');
  await expect(demo).toHaveAttribute('data-playing', 'false');
  await replay.focus();
  await page.keyboard.press('Space');
  await expect(demo).toHaveAttribute('data-run', '3');
  expect(await saved(page)).toBe(state);
});

test('锚点和键盘焦点立即显示目标，渐入只播放一次', async ({ page }) => {
  await page.getByRole('link', { name: '游戏介绍', exact: true }).click();
  await expect(page.locator('#introduction')).toHaveAttribute('data-reveal', 'visible');
  await page.getByRole('link', { name: '开始游戏', exact: true }).click();
  await expect(page.locator('#game')).toBeFocused();
  await expect(page.locator('#game')).toHaveAttribute('data-reveal', 'visible');
  await page.getByRole('button', { name: '重播移动方块演示' }).focus();
  await expect(page.locator('#how-to-play')).toHaveAttribute('data-reveal', 'visible');
  await page.locator('#game').scrollIntoViewIfNeeded();
  await page.locator('#how-to-play').scrollIntoViewIfNeeded();
  await expect(page.locator('#how-to-play')).toHaveAttribute('data-reveal', 'visible');
});

test('减少动态效果直接呈现棋盘、静态反馈与胜负对话框', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.getByTestId('score-gain')).toHaveText('+4');
  await expect(page.getByTestId('score-gain')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: '重播达成 2048演示' }).click();
  await expect(page.locator('[data-demo="win"]')).toHaveAttribute('data-playing', 'false');
  await seed(page, [
    [1024, 1024, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('dialog', { name: '达成 2048！' })).toBeVisible();
  await expect(page.getByRole('gridcell', { name: '第 1 行，第 1 列，2048' })).toBeVisible();
  await page.getByRole('button', { name: '继续游戏' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await seed(page, [
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [4, 2, 4, 0],
  ]);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('dialog', { name: '游戏结束' })).toBeVisible();
});

test('损坏存档回退，主题支持键盘且不重置撤销', async ({ page }) => {
  await page.evaluate(() => sessionStorage.setItem('optimization-seed', '{"board":[[3]]}'));
  await page.reload();
  await expect(page.getByRole('gridcell')).toHaveCount(16);
  await expect
    .poll(
      async () =>
        JSON.parse((await saved(page)) ?? '{}')
          .board?.flat()
          .filter(Boolean).length,
    )
    .toBe(2);
  const initial = JSON.parse((await saved(page)) ?? '{}');
  expect(initial.board.flat().filter(Boolean)).toHaveLength(2);
  await page.locator('#game').focus();
  await page.keyboard.press('a');
  const state = await saved(page);
  await page.getByRole('button', { name: '深色', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '浅色', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await saved(page)).toBe(state);
  await expect(page.getByRole('button', { name: '单步撤销' })).toBeEnabled();
});

test('导航按固定参考线标记唯一当前板块且不移动焦点', async ({ page }) => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('nav [aria-current="location"]')).toHaveCount(0);

  for (const [id, name] of [
    ['introduction', '游戏介绍'],
    ['how-to-play', '玩法说明'],
    ['game', '开始游戏'],
  ] as const) {
    await page.evaluate((sectionId) => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }, id);
    const current = page.getByRole('link', { name, exact: true });
    await expect(current).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('nav [aria-current="location"]')).toHaveCount(1);
    await expect(current).not.toBeFocused();
  }
});

test('方向输入联动按钮并在失焦后清除，且无效移动不冒充合并', async ({ page }) => {
  await seed(page, [
    [2, 4, 8, 16],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const left = page.getByRole('button', { name: '向左移动' });
  await page.keyboard.press('ArrowLeft');
  await expect(left).toHaveAttribute('data-pressed', 'true');
  await expect(left).toHaveCSS('animation-name', 'direction-press');
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.locator('[data-feedback="merge"]')).toHaveCount(0);
  await expect(page.getByTestId('current-score')).toHaveText('0');

  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(left).not.toHaveAttribute('data-pressed', 'true');

  const right = page.getByRole('button', { name: '向右移动' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('ArrowRight');
  await expect(right).not.toHaveAttribute('data-pressed', 'true');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await right.click();
  await expect(right).toHaveAttribute('data-pressed', 'true');
});

test('成功撤销显示一次不抢焦点的提示', async ({ page }) => {
  await page.keyboard.press('ArrowLeft');
  const undo = page.getByRole('button', { name: '单步撤销' });
  await undo.click();
  await expect(page.getByTestId('undo-feedback')).toHaveText('✓ 已撤销');
  await expect(page.getByTestId('current-score')).toHaveText('0');
  await expect(page.getByTestId('undo-feedback')).not.toBeFocused();
  await expect(undo).toBeDisabled();
  await expect(page.getByTestId('undo-feedback')).toHaveCount(0, { timeout: 2000 });
});

test('主题选中底板滑动并保留状态与减少动态效果降级', async ({ page }) => {
  const switcher = page.getByRole('group', { name: '页面主题' });
  const indicator = switcher.locator('[aria-hidden="true"]').first();
  const state = await saved(page);
  await page.getByRole('button', { name: '浅色', exact: true }).click();
  const lightX = (await indicator.boundingBox())?.x ?? 0;

  await page.getByRole('button', { name: '深色', exact: true }).click();
  await expect(switcher).toHaveAttribute('data-theme-mode', 'dark');
  await expect(page.getByRole('button', { name: '深色', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect
    .poll(async () => (await indicator.boundingBox())?.x ?? 0)
    .toBeGreaterThan(lightX + 80);
  expect(await saved(page)).toBe(state);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: '浅色', exact: true }).click();
  await expect(indicator).toHaveCSS('transition-duration', '0s');
});

for (const width of [1440, 1024, 600, 375]) {
  test(`深浅主题 ${width}px 布局稳定与静态截图`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const mode of ['浅色', '深色']) {
      await page.getByRole('button', { name: mode, exact: true }).click();
      for (const id of ['introduction', 'how-to-play', 'game'])
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
      const measurements = await page.evaluate(() => {
        const board = document
          .querySelector('[data-testid="board-surface"]')
          ?.getBoundingClientRect();
        return {
          scroll: document.documentElement.scrollWidth,
          viewport: innerWidth,
          width: board?.width,
          height: board?.height,
        };
      });
      expect(measurements.scroll).toBeLessThanOrEqual(measurements.viewport);
      expect(Math.abs((measurements.width ?? 0) - (measurements.height ?? 0))).toBeLessThan(1);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({
        path: testInfo.outputPath(`${mode}-${width}.png`),
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
}

test('对话框保持键盘焦点，取消返回触发控件', async ({ page }) => {
  const restart = page.getByRole('button', { name: '重新开始', exact: true });
  await restart.click();
  await expect(page.getByRole('button', { name: '确认重开' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '取消' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: '确认重开' })).toBeFocused();
  const state = await saved(page);
  await page.keyboard.press('ArrowLeft');
  expect(await saved(page)).toBe(state);
  await page.keyboard.press('Escape');
  await expect(restart).toBeFocused();
});

test('不支持观察器时内容和演示静态可读', async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
  });
  await page.reload();
  await expect(page.getByRole('grid')).toBeVisible();
  for (const title of ['游戏介绍', '玩法说明', '开始挑战'])
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await expect(page.locator('[data-demo="merge"]')).toHaveAttribute('data-playing', 'false');
});

test('离屏暂停持续装饰，减少动态效果切换不重播旧移动', async ({ page }) => {
  await expect(page.locator('[data-paused]')).toHaveAttribute('data-paused', 'true');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('[data-paused]')).toHaveAttribute('data-paused', 'false');
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowLeft');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
  await expect(page.getByRole('gridcell', { name: '第 1 行，第 1 列，4' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByTestId('board-surface')).toHaveAttribute('data-animating', 'false');
});
