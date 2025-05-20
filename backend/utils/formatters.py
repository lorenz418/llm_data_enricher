from phonenumbers import format_number, parse, PhoneNumberFormat, is_valid_number
import re
import urllib.parse
import phonenumbers


def format_german_phone(phone_string: str) -> str:
    """
    Format a German phone number to international format.
    
    Args:
        phone_string: The phone number string to format
        
    Returns:
        Formatted phone number string or empty string if invalid
        
    Raises:
        ValueError: If phone number parsing fails
    """
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
    
def build_google_maps_url(street: str, city: str, postal_code: str) -> str:
    """
    Build a Google Maps URL from address components.
    
    Args:
        street: Street address
        city: City name
        postal_code: Postal code
        
    Returns:
        Google Maps URL or empty string if address components are invalid
    """
    if not all([street, city, postal_code]) or 'NA' in [street, city, postal_code]:
        return ""
        
    address = f"{street}, {postal_code} {city}, Germany"
    base_url = "https://www.google.com/maps/search/"
    encoded_address = urllib.parse.quote(address)
    return f"{base_url}{encoded_address}"

