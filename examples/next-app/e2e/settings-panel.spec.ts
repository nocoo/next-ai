import { expect, gotoSettings, test, waitForPut } from "./helpers";

const SETTINGS_PATH = "/settings/ai";

test.beforeEach(async ({ request }) => {
  await request.delete("/api/settings/ai");
});

test("default provider is anthropic on first load", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await expect(page.locator("#ai-provider-select")).toHaveValue("anthropic");
});

test("switching provider repopulates the model select", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await page.locator("#ai-provider-select").selectOption("aihubmix");
  await expect(page.locator("#ai-provider-select")).toHaveValue("aihubmix");

  const modelSelect = page.locator("#ai-model-select");
  await expect(modelSelect).toBeVisible();
  await expect(modelSelect.locator("option[value='gpt-4o-mini']")).toHaveCount(
    1,
  );
});

test("api key field is masked", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await expect(page.locator("#ai-api-key-input")).toHaveAttribute(
    "type",
    "password",
  );
});

test("stored indicator appears after save and reload", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await page.locator("#ai-api-key-input").fill("sk-test-1234");

  const putResponse = waitForPut(page);
  await page.getByRole("button", { name: "Save Settings" }).click();
  await putResponse;

  await gotoSettings(page, SETTINGS_PATH);
  await expect(
    page.getByText("API key is set. Enter a new key to update it."),
  ).toBeVisible();
});

test("save calls PUT and triggers onSaveSuccess", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await page.locator("#ai-api-key-input").fill("sk-test-abc");

  let putCount = 0;
  page.on("request", (req) => {
    if (
      req.method() === "PUT" &&
      req.url().includes("/api/settings/ai") &&
      !req.url().includes("/test")
    ) {
      putCount += 1;
    }
  });

  const putResponse = waitForPut(page);
  await page.getByRole("button", { name: "Save Settings" }).click();
  const res = await putResponse;
  expect(res.ok()).toBeTruthy();

  await expect(page.getByTestId("save-success-count")).toHaveText("1");
  // After save, the input is cleared and the stored-key placeholder is shown.
  await expect(
    page.getByText("API key is set. Enter a new key to update it."),
  ).toBeVisible();
  expect(putCount).toBe(1);
});

test("reload preserves saved provider and model", async ({ page }) => {
  await gotoSettings(page, SETTINGS_PATH);
  await page.locator("#ai-provider-select").selectOption("aihubmix");
  await expect(page.locator("#ai-provider-select")).toHaveValue("aihubmix");
  await expect(
    page.locator("#ai-model-select option[value='gpt-4o-mini']"),
  ).toHaveCount(1);
  await page.locator("#ai-model-select").selectOption("gpt-4o-mini");
  await page.locator("#ai-api-key-input").fill("sk-test-x");

  const putResponse = waitForPut(page);
  await page.getByRole("button", { name: "Save Settings" }).click();
  await putResponse;

  await page.goto(SETTINGS_PATH);
  await expect(page.locator("#ai-provider-select")).toHaveValue("aihubmix");
  await expect(page.locator("#ai-model-select")).toHaveValue("gpt-4o-mini");
});
