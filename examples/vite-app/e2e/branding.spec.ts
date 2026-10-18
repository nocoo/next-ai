import { expect, test } from "@playwright/test";

test("example uses the transparent brand mark and favicon", async ({
  page,
}) => {
  await page.goto("/");
  const logo = page.getByRole("img", { name: "next-ai logo" });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("src", "/logo-64.png");
  await expect(logo).toHaveCSS("border-radius", "0px");
  expect(
    await logo.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBe(64);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon.ico",
  );
  const response = await page.request.get("/favicon.ico");
  expect(response.ok()).toBeTruthy();
});
