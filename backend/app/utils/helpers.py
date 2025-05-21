import urllib.parse


def all_data_fields_filled(data: dict) -> bool:
    for field in data:
        if not data[field]:
            return False
    return True

def extract_domain(url: str) -> str:
    try:
        parsed = urllib.parse.urlparse(url)
        return parsed.netloc
    except Exception:
        return ""
    
def clean_text(text: str) -> str:
    if not text:
        return ""
    return " ".join(text.strip().split())
    
def get_smartproxy_url(username: str, password: str, endpoint: str = "de.smartproxy.com", port: int = 20001) -> str:
    return f"https://{username}:{password}@{endpoint}:{port}"

def merge_scraped_results(scraped_results: list[dict]) -> dict:
    merged_results = {key: None for key in scraped_results[0]}
    merged_results.pop("relevance")
    merged_results.pop("search_ranking")
    
    sorted_scraped_results = sorted(
        scraped_results, 
        key=lambda search_result: (-search_result['relevance'], search_result['search_ranking'])
    )

    print(sorted_scraped_results)

    for result in sorted_scraped_results:
        for key in merged_results:
            # Check if current value evaluates to False and new value evaluates to True
            if not merged_results[key] and result[key]:
                merged_results[key] = result[key]
        if all_data_fields_filled(merged_results):
            break

    return merged_results

    