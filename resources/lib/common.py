import re

class SessionStatus:
    EMPTY = "empty"
    ACTIVE = "active"
    INACTIVE = "inactive"

class PinAction:
    RESET = 0
    INPUT = 1
    SKIP = 2

def strip_html(text):
    return re.sub('<[^>]*?>', '', text)
