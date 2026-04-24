import { expect, test } from "@playwright/test";
import { gotoSettings, waitForPut } from "./helpers";

const SETTINGS_PATH = "/";

test.beforeEach(async ({ request }) => {
  await request.delete("/api/settings/ai");
});

test("selecting custom reveals baseURL and sdkType inputs", async ({
  page,
}) => {
  await gotoSettings(page, SETTINGS_PATH);
  await expect(page.locator("#ai-base-url-input")).toHaveCount(0);

  await page.locator("#ai-provider-select").selectOption("custom");
  await expect(page.locator("#ai-provider-select")).toHaveValue("custom");

  await expect(page.locator("#ai-base-url-input")).toBeVisible();
  await expect(page.locator("#ai-sdk-type-select")).toBeVisible();
});

test("custom config persists after reload", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await page.locator("#ai-provider-select").selectOption("custom");
  await expect(page.locator("#ai-provider-select")).toHaveValue("custom");
  await expect(page.locator("#ai-base-url-input")).toBeVisible();

  await page.locator("#ai-base-url-input").fill("https://example.test/v1");
  await page.locator("#ai-sdk-type-select").selectOption("openai");
  await page.locator("#ai-model-select").fill("my-model");
  await page.locator("#ai-api-key-input").fill("sk-custom");

  const putResponse = waitForPut(page);
  await page.getByRole("button", { name: "Save Settings" }).click();
  await putResponse;

  await gotoSettings(page, SETTINGS_PATH);
  await expect(page.locator("#ai-provider-select")).toHaveValue("custom");
  await expect(page.locator("#ai-base-url-input")).toHaveValue(
    "https://example.test/v1",
  );
  await expect(page.locator("#ai-sdk-type-select")).toHaveValue("openai");
  await expect(page.locator("#ai-model-select")).toHaveValue("my-model");
  await expect(
    page.getByText("API key is set. Enter a new key to update it."),
  ).toBeVisible();
});
