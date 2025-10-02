#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
import traceback
try:
    import app.main
    print('SUCCESS: App imported successfully')
except Exception as e:
    print(f'ERROR: {e}')
    traceback.print_exc()
