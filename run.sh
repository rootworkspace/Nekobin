#!/bin/bash

# Exit on any error
set -e

echo "📦 Building Frontend..."
cd frontend
npm run build
cd ..

echo "📂 Moving build files..."
rm -R dist
mv frontend/dist dist

echo "🔥 Launching Backend..."
pip install -r backend/requirements.txt
python backend/main.py