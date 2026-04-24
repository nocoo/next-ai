import { expect, gotoSettings, test, waitForTest } from "./helpers";

const SETTINGS_PATH = "/";

test.beforeEach(async ({ request }) => {
  await request.delete("/api/settings/ai");
});

test("test connection button calls POST endpoint", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await page.locator("#ai-api-key-input").fill("sk-test");

  const testResponse = waitForTest(page);
  await page.getByRole("button", { name: "Test Connection" }).click();
  const res = await testResponse;
  expect(res.ok()).toBeTruthy();
});

test("successful test renders model name in success badge", async ({
  page,
}) => {
  await gotoSettings(page, SETTINGS_PATH);
  await page.locator("#ai-api-key-input").fill("sk-test");

  const testResponse = waitForTest(page);
  await page.getByRole("button", { name: "Test Connection" }).click();
  await testResponse;

  await expect(page.getByText("✓ Connection successful")).toBeVisible();
  await expect(page.getByText("(claude-sonnet-4-20250514)")).toBeVisible();
});
