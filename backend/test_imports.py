import sys
import os

print("Current working directory:", os.getcwd())
print("\nPython path:")
for p in sys.path:
    print(p)

print("\nTrying to import...")
try:
    from app.core.database import Base, engine
    print("Successfully imported Base and engine!")
except ImportError as e:
    print(f"Import error: {e}")
