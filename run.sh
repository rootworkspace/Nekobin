#!/bin/bash

# Exit on any error
set -e

echo "📦 Building Frontend..."
cd frontend
npm run build
cd ..

echo "🔥 Launching Backend..."
pip install -r requirements.txt
python3 main.py