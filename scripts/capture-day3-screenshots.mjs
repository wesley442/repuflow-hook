import { chromium } from "playwright";
import path from "node:path";

const outputDir = path.resolve("demo-output");
const browser = await chromium.launch({
  headless: true,
  args: ["--window-size=1440,1024"]
});

const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1
});

const page = await context.newPage();
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

await page.locator(".profile-row.good-agent").click();
await page.getByRole("button", { name: /Run Demo Swap/i }).click();
await page.waitForTimeout(600);
await page.locator(".profile-row.toxic-flow").click();
await page.getByRole("button", { name: /Run Demo Swap/i }).click();
await page.waitForTimeout(800);

await page.evaluate(() => {
  const deployment = document.getElementById("deployment");
  if (!deployment) return;
  window.scrollTo({ top: deployment.offsetTop - 84, behavior: "instant" });
});
await page.waitForTimeout(600);

await page.screenshot({
  path: path.join(outputDir, "day3-x-post-deployment-16x9.png"),
  fullPage: false
});

await page.screenshot({
  path: path.join(outputDir, "day3-x-post-clean.png"),
  clip: {
    x: 280,
    y: 250,
    width: 1296,
    height: 620
  }
});

await page.locator("#deployment").screenshot({
  path: path.join(outputDir, "day3-deployment-card.png")
});

await page.locator("#evidence").screenshot({
  path: path.join(outputDir, "day3-evidence-card.png")
});

await page.screenshot({
  path: path.join(outputDir, "day3-dashboard-fullpage.png"),
  fullPage: true
});

await browser.close();

console.log(path.join(outputDir, "day3-x-post-deployment-16x9.png"));
console.log(path.join(outputDir, "day3-x-post-clean.png"));
console.log(path.join(outputDir, "day3-deployment-card.png"));
console.log(path.join(outputDir, "day3-evidence-card.png"));
console.log(path.join(outputDir, "day3-dashboard-fullpage.png"));
