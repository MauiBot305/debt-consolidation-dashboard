#!/usr/bin/env bash
# Tailwind CSS Build Script
# Currently using CDN (development). For production:
# 1. npm install -D tailwindcss
# 2. npx tailwindcss init
# 3. Configure content paths in tailwind.config.js
# 4. Run: npx tailwindcss -i ./src/input.css -o ./public/dist/tailwind.css --minify
# 5. Replace CDN <script> in index.html with <link rel="stylesheet" href="/dist/tailwind.css">
echo 'Tailwind CDN is used for development. See comments in this script for production setup.'
