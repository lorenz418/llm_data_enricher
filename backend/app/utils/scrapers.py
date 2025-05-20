from bs4 import BeautifulSoup
import requests
from helpers import extract_domain, clean_text, filter_search_results
from scrapegraphai.graphs import SmartScraperGraph

GRAPH_CONFIG = GRAPH_CONFIG = {
    "llm": {
        "model": "ollama/mistral",
        "model_tokens": 8192
    },
    "headless": True,
    "verbose": False,
}


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

    return filter_search_results(results, relevant_domains)


def scrape_company_data(search_result: list[dict], relevant_domains: list[dict], prompt: str) -> dict:
    scraped_company_data = []
    
    for result in search_result:
        # Find matching domain from relevant_domains
        matching_domain = next(
            (domain for domain in relevant_domains if domain['domain'] in result['domain']),
            None
        )

        if matching_domain['headless_parsing']:
            scraped_data = headless_scraper(result['link'], prompt)
        
        
        scraped_data['relevance'] = matching_domain['relevance']
        scraped_data['search_ranking'] = result['search_ranking']
        scraped_data['data_source'] = result['link']

        scraped_company_data.append(scraped_data)

    return scraped_company_data

def headless_scraper(link: str, prompt: str):
    smart_scraper = SmartScraperGraph(
        prompt=prompt,
        source=link,
        config=GRAPH_CONFIG
    )

    return smart_scraper.run()


serach_results=search_company(search_query="Agrargenossenschaft Bad Dürrenberg e.G.", relevant_domains=[{'domain': 'dasoertliche', 'headless_parsing': True, 'relevance': 1}])

search_result=scrape_company_data(serach_results, relevant_domains=[{'domain': 'dasoertliche', 'headless_parsing': True, 'relevance': 1}], prompt="{phone:string}")

print(search_result)