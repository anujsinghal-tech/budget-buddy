#!/bin/bash
cd budget-buddy
# Build the project
npm run build
cd ..
# Copy dist files to docs/
rm -rf docs/
cp -r budget-buddy/dist/* docs/

# Add, commit, and push changes
git add .
git commit -m "Deploy: update docs with latest build"
git push