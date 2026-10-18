import { expect, test } from "@playwright/test";

test("example routes use the transparent brand mark and favicon", async ({
  page,
}) => {
  for (const route of ["/", "/settings/ai"]) {
    await page.goto(route);
    const logo = page.getByRole("img", { name: "next-ai logo" });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", "/logo-64.png");
    await expect(logo).toHaveCSS("border-radius", "0px");
    expect(
      await logo.evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBe(64);
    const favicon = page.locator('link[rel="icon"]').first();
    await expect(favicon).toHaveAttribute("href", /\/favicon\.ico/);
    const response = await page.request.get("/favicon.ico");
    expect(response.ok()).toBeTruthy();
  }
});
