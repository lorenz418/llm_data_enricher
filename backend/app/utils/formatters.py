from phonenumbers import format_number, parse, PhoneNumberFormat
import re
import urllib.parse
import phonenumbers

def format_german_phone(phone_string: str) -> str:
    if not phone_string:
        return ""
    
    # Remove any '+' characters from the phone string
    phone_string_clean = re.sub(r'[^A-Za-z0-9\s]', '', phone_string)
    
    # If the number starts with 49, add two zeros in front
    if phone_string_clean.strip().startswith('49'):
        phone_string_clean = '00' + phone_string_clean.strip()

    try:
        phone_number = parse(phone_string_clean, "DE")
        if not phonenumbers.is_valid_number(phone_number):
            return phone_string
        return format_number(phone_number, PhoneNumberFormat.INTERNATIONAL)
    except Exception:
        return

def validate_email(email: str) -> bool:
    if not email:
        return False
    
    # Basic email format validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))

def validate_website(website: str) -> bool:
    if not website:
        return False
    return bool(re.search(r'(www\.|https?://|\.(de|com|org|net))', website.lower()))

def keys_match(data: dict, required_fields: list) -> bool:
    return all(field in data for field in required_fields)

def clean_scraped_results(scraped_results: list[dict]) -> list[dict]:
    for result in scraped_results:
        for key in result:
            if not result[key] or len(result[key]) <= 2:
                result[key] = None

            if key.contains("phone") or key.contains("nummer"):
                result[key] = format_german_phone(result[key])
            
            if key.contains("email") or key.contains("mail"):
                if not validate_email(result[key]):
                    result[key] = None

            if key.contains("website") or key.contains("webseite"):
                if not validate_website(result[key]):
                    result[key] = None
    
    return scraped_results
    
def build_google_maps_url(street: str, city: str, postal_code: str) -> str:
    if not all([street, city, postal_code]) or 'NA' in [street, city, postal_code]:
        return ""
        
    address = f"{street}, {postal_code} {city}, Germany"
    base_url = "https://www.google.com/maps/search/"
    encoded_address = urllib.parse.quote(address)
    return f"{base_url}{encoded_address}"

