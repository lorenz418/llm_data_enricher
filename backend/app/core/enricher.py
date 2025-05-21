from app.utils.scrapers import search_company, scrape_company_data

def company_enricher(company_query: str, relevant_domains: list[dict], prompt: str) -> dict:

    search_results = search_company(company_query, relevant_domains)

    scraped_company_data = scrape_company_data(search_results, relevant_domains, prompt)

    return scraped_company_data


DIRECTORY_SITES = [
    {
        'domain': 'dastelefonbuch.de',
        'relevance': 0,
        'headless_parsing': True
    },
    {
        'domain': 'dasoertliche.de',
        'relevance': 0,
        'headless_parsing': True
    },
    {
        'domain': 'meinestadt.de',
        'relevance': 0,
        'headless_parsing': True
    },
    {
        'domain': 'gelbeseiten.de',
        'relevance': 0,
        'headless_parsing': True
    }, 
    {
        'domain': 'creditreform.de',
        'relevance': 1,
        'headless_parsing': False
    },
    
]

# LLM prompts
PROMPT_SEARCH = '''
Given the website, extract all the relevant data from the website, needed to fill the schema.
Don't include any other text than the data. Do not infer or fabricate any information.
Only include real, verifiable data that is explicitly visible on the website.

For the website identification:
- only add the website to the data if it can be clearly associated with the company
- the second-level domain should clearly be related to the company name in some way
- the second-level domain should not be a business directory, marketplace or general websites for company information
- must be a real website with www included and not just a business name

If you are not able to find a data field, leave the field empty, simply an empty string.

Given schema:
{
    "phone": string,
    "email": string,
    "straße": string,
    "ort": string,
    "plz": string,
    "website": string
}
'''

if __name__ == "__main__":
    print(company_enricher("Agrargenossenschaft eG Calbe", DIRECTORY_SITES, PROMPT_SEARCH))

