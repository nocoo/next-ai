import { type Page, expect } from "@playwright/test";

/**
 * Navigate to the settings page and wait for the initial GET to complete
 * so that subsequent interactions are not racing with the settings effect
 * that resyncs form state from the loaded settings.
 */
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
