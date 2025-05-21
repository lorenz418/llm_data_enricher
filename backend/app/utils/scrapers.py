from bs4 import BeautifulSoup
import requests
from .helpers import extract_domain, get_smartproxy_url, merge_scraped_results
from .formatters import clean_scraped_results, build_google_maps_url, keys_match
from scrapegraphai.graphs import SmartScraperGraph
import random
import time
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv
import os

load_dotenv()

GRAPH_CONFIG = GRAPH_CONFIG = {
    "llm": {
        "model": "ollama/mistral",
        "model_tokens": 8192
    },
    "headless": True,
    "verbose": False,
}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15"
]

PROXY_USERNAME = os.getenv('PROXY_USERNAME')
PROXY_PASSWORD = os.getenv('PROXY_PASSWORD')

def search_company(search_query: str, relevant_domains: list[dict], max_results: int = 10):
    search_engine_url = "https://html.duckduckgo.com/html/"

    respons = requests.post(
        search_engine_url,
        data={'q': search_query},
        headers={'User-Agent': 'Mozilla/5.0'}
    )

    soup = BeautifulSoup(respons.text, 'html.parser')

    results = []

    for search_ranking ,result_container in enumerate(soup.find_all('div', class_='result', limit=max_results)):
        title_link = result_container.find('a', class_='result__a')

        if not title_link:
            continue

        link = title_link['href']
        domain = extract_domain(link)

        results.append({
            'link': link,
            'domain': domain,
            'search_ranking': search_ranking + 1
        })

    return results


def scrape_company_data(search_result: list[dict], relevant_domains: list[dict], prompt: str) -> dict:
    scraped_company_data = []
    
    for result in search_result:
        # Find matching domain from relevant_domains
        matching_domain = next(
            (domain for domain in relevant_domains if domain['domain'] in result['domain']),
            None
        )

        if matching_domain is None:
            continue
        if matching_domain['headless_parsing']:
            scraped_data = base_scraper(result['link'], prompt)
        else:
            scraped_data = creditreform_scraper(result['link'], prompt)
        
        
        scraped_data['relevance'] = matching_domain['relevance']
        scraped_data['search_ranking'] = result['search_ranking']
        scraped_data['data_source'] = result['link']

        scraped_company_data.append(scraped_data)

        scraped_company_data = clean_scraped_results(scraped_company_data)
        
        final_data = merge_scraped_results(scraped_company_data)

        if keys_match(final_data, ['straße', 'ort', 'plz']):
            final_data['google_maps_url'] = build_google_maps_url(final_data['straße'], final_data['ort'], final_data['plz'])

        if keys_match(final_data, ['street', 'city', 'postal_code']):
            final_data['google_maps_url'] = build_google_maps_url(final_data['street'], final_data['city'], final_data['postal_code'])

    
    return final_data

def base_scraper(link: str, prompt: str):
    smart_scraper = SmartScraperGraph(
        prompt=prompt,
        source=link,
        config=GRAPH_CONFIG
    )

    return smart_scraper.run()

def creditreform_scraper(link: str, prompt: str):
    proxy_url = get_smartproxy_url(PROXY_USERNAME, PROXY_PASSWORD)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=False,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                ]
            )

            context = browser.new_context(
                user_agent=random.choice(USER_AGENTS),
                viewport={"width": 320, "height": 240},
                proxy={
                    "server": proxy_url,
                    "username": PROXY_USERNAME,
                    "password": PROXY_PASSWORD,
                    "bypass": "*.google-analytics.com,*.google.com,*.gstatic.com,*.googleapis.com"
                }
            )

            context.route("**/*.{png,jpg,jpeg,gif,svg,woff2,css}", lambda route: route.abort())
            context.route("**/analytics.js", lambda route: route.abort())
            context.route("**/gtag.js", lambda route: route.abort())
            context.route("**/adsbygoogle.js", lambda route: route.abort())

            page = context.new_page()
            page.goto(link)

            # Accept cookies with timeout
            try:
                page.wait_for_selector('button[data-testid="uc-accept-all-button"]', timeout=10000)
                page.click('button[data-testid="uc-accept-all-button"]')
                time.sleep(random.uniform(0.5, 1.5))
            except Exception as e:
                print(f"Cookie handling failed: {str(e)}")
                # Continue even if cookie handling fails
            
            # Extract email with timeout
            try:
                page.wait_for_selector('span:has-text("E-Mail-Adresse anzeigen")', timeout=5000)
                page.click('span:has-text("E-Mail-Adresse anzeigen")')
                page.wait_for_selector('a[href^="mailto:"]', timeout=5000)
                time.sleep(random.uniform(0.5, 1.5))
            except Exception as e:
                print(f"Email field not found or not clickable: {str(e)}")
            
            # Extract contact information with timeout
            try:
                contact_div = page.locator('div#kontakt').inner_html(timeout=5000)
                html_content = f"<div id='kontakt'>{contact_div}</div>"
            except Exception as e:
                print(f"Failed to extract contact information: {str(e)}")
                browser.close()
                return None
            
            scraped_data = base_scraper(html_content, prompt)

            browser.close()

            return scraped_data

    except Exception as e:
        print(f"Scraping failed: {e}")
        return None
