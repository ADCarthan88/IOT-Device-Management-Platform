from datetime import datetime, timezone

def utcnow():
    """Get the current UTC time with timezone awarness."""
    return datetime.now(timezone.utc)