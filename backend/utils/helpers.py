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