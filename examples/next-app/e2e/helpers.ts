import {
  type APIRequestContext,
  type Page,
  test as base,
  expect,
} from "@playwright/test";

export const test = base.extend<{
  bucket: string;
  page: Page;
  request: APIRequestContext;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: fixture has no dependencies
  bucket: async ({}, use, testInfo) => {
    const id = `${testInfo.workerIndex}-${testInfo.testId}`;
    await use(id);
  },
  page: async ({ browser, bucket }, use) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { "x-test-bucket": bucket },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  request: async ({ playwright, baseURL, bucket }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "x-test-bucket": bucket },
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect };

export async function gotoSettings(page: Page, path: string): Promise<void> {
  const initialLoad = page.waitForResponse(
    (r) =>
      r.url().includes("/api/settings/ai") &&
      !r.url().includes("/test") &&
      r.request().method() === "GET",
  );
  await page.goto(path);
  await initialLoad;
  // Wait for the form to sync from the loaded settings (controlled by useEffect).
  await expect(page.locator("#ai-provider-select")).not.toHaveValue("");
}

export async function waitForPut(page: Page) {
  return page.waitForResponse(
    (r) =>
      r.url().includes("/api/settings/ai") &&
      !r.url().includes("/test") &&
      r.request().method() === "PUT",
  );
}

export async function waitForTest(page: Page) {
  return page.waitForResponse(
    (r) =>
      r.url().includes("/api/settings/ai/test") &&
      r.request().method() === "POST",
  );
}
