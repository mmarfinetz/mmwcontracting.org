#!/bin/bash

# Activate the virtual environment
source venv/bin/activate

# Serve the root directory where the Windows 95-themed interface is located
echo "Serving the root directory with the Windows 95-themed interface"
python serve.py . 