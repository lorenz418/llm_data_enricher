

def validate_email(email: str) -> bool:
    """
    Validate an email address format.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email is valid, False otherwise
    """
    if not email:
        return False
    return "@" in email and "." in email.split("@")[1]

def validate_website(website: str) -> bool:
    pass

def validate_address():
    pass

