import urllib.parse

def extract_domain(url: str) -> str:
    """
    Extract domain from URL.
    
    Args:
        url: URL to extract domain from
        
    Returns:
        Domain name or empty string if invalid URL
    """
    try:
        parsed = urllib.parse.urlparse(url)
        return parsed.netloc
    except Exception:
        return ""
    
def clean_text(text: str) -> str:
    """
    Clean text by removing extra whitespace and normalizing.
    
    Args:
        text: Text to clean
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    return " ".join(text.strip().split())
    

def get_smartproxy_url(username: str, password: str, endpoint: str = "de.smartproxy.com", port: int = 20001) -> str:
    """
    Generate SmartProxy URL for authentication.
    
    Args:
        username: SmartProxy username
        password: SmartProxy password
        endpoint: SmartProxy endpoint (default: de.smartproxy.com)
        port: SmartProxy port (default: 20001)
        
    Returns:
        Formatted proxy URL string
    """
    return f"https://{username}:{password}@{endpoint}:{port}"


def filter_search_results(search_results: list[dict], relevant_domains: list[dict]) -> list[dict]:
    filtered_results = []

    for result in search_results:
        if any(domain['domain'] in result['domain'] for domain in relevant_domains):
            filtered_results.append(result)

    return filtered_results