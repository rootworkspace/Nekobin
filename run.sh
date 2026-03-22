#!/bin/bash

# Exit on any error
set -e

skip_build=false

for arg in "$@"; do
  if [ "$arg" == "--skip-build" ]; then
    skip_build=true
  fi
done

if [ "$skip_build" == true ]; then
  echo "📦 Skipping Frontend Build..."
else
  echo "📦 Building Frontend..."
  cd frontend
  rm -R dist
  npm run build
  cd ..
fi

echo "🔥 Launching Backend..."
pip install -r requirements.txt
python3 main.py