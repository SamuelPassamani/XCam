import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Get the absolute path to the test file
        file_path = os.path.abspath('xcam-beta/test.html')

        # Navigate to the local HTML file
        await page.goto(f'file://{file_path}')

        # Wait for the results container to have some content
        # This indicates that the tests have run
        results_container = page.locator("#results")
        await expect(results_container).not_to_be_empty(timeout=5000)

        # Take a screenshot of the results
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())