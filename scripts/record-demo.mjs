import { chromium } from "playwright";
import path from "node:path";

const outputDir = path.resolve("demo-output/playwright-recording");

const browser = await chromium.launch({
  headless: true,
  args: ["--window-size=1440,1024"]
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 1024 },
  recordVideo: {
    dir: outputDir,
    size: { width: 1440, height: 1024 }
  }
});

const page = await context.newPage();
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

async function clickText(text, delay = 1200) {
  await page.getByText(text, { exact: true }).click();
  await page.waitForTimeout(delay);
}

async function scrollToSection(id, delay = 1200) {
  await page.evaluate((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, id);
  await page.waitForTimeout(delay);
}

await clickText("Normal Trader", 900);
await clickText("Run Demo Swap", 1200);
await clickText("Good Agent", 900);
await clickText("Run Demo Swap", 1200);
await clickText("Toxic Flow", 900);
await clickText("Run Demo Swap", 1500);

await page.locator(".deploy-button").click();
await page.waitForTimeout(1200);

await scrollToSection("deployment", 1200);
await scrollToSection("evidence", 1300);

await page.locator(".docs-button").click();
await page.waitForTimeout(1800);
await scrollToSection("docs", 1000);

await page.mouse.wheel(0, 650);
await page.waitForTimeout(1600);

await context.close();
await browser.close();

console.log(outputDir);
