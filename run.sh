#!/bin/bash

# Exit on any error
set -e

skip_build=false

for arg in "$@"; do
  if [ "$arg" == "--skip-build" ]; then
    skip_build=true
  fi
done

# Install dependencies
echo "📦 Installing Dependencies..."
pip install -r requirements.txt
cd web
npm install
cd ..

if [ "$skip_build" == true ]; then
  echo "📦 Skipping Frontend Build..."
else
  echo "📦 Building Frontend..."
  cd web
  if [ -d "dist" ]; then
      rm -R dist
  fi
  npm run build
  cd ..
fi

echo "🔥 Launching Backend..."
pip install -r requirements.txt
python3 main.py