import sys
import os

def check_desktop_enviroment():
    if sys.platform.startswith('win'):
        return True
    else:
        # Unix-like environment detected
        # Check for desktop environment and enable tray icon if present
        if os.environ.get('DISPLAY'):
            return True
        else:
            return False