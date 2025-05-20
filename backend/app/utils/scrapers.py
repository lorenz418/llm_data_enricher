from bs4 import BeautifulSoup
import requests

def search_company(search_query: str, max_results: int = 10):
    search_engine_url = "https://html.duckduckgo.com/html/"

    respons = requests.post(
        search_engine_url,
        data={'q': search_query},
        headers={'User-Agent': 'Mozilla/5.0'}
    )

    soup = BeautifulSoup(respons.text, 'html.parser')

    results = []

    for result_container in soup.find_all('div', class_='result', limit=max_results):
        title_link = result_container.find('a', class_='result__a')


        if not title_link:
            continue

        link = title_link['href']
        domain = extract_domain(link)

        results.append({
            'title': clean_text(title_link.get_text()),
            'link': link,
            'domain': domain,
        })

    return results

   