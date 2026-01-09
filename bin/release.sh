#!/bin/bash
# Release script for uploading ISO to GitHub Releases
# Requires: .env file with GITHUB_TOKEN

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Load environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create it with GITHUB_TOKEN=your_token"
    exit 1
fi

source .env

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN not set in .env file"
    exit 1
fi

# Check if ISO exists
if [ ! -f nixos-custom.iso ]; then
    echo "Error: nixos-custom.iso not found. Please build it first."
    exit 1
fi

# Check if zip parts exist, create if needed
if [ ! -f nixos-custom.iso.zip ] || [ ! -f nixos-custom.iso.z01 ]; then
    echo "Creating multi-part zip archive..."
    zip -s 1900m -r nixos-custom.iso.zip nixos-custom.iso
fi

# Get version tag (default to v1.0.0 if not provided)
VERSION_TAG="${1:-v1.0.0}"
REPO="Leopere/ai-live-colinknapp-com"

echo "Creating release $VERSION_TAG..."

# Create or update release
RELEASE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$REPO/releases" \
    -d "{
        \"tag_name\": \"$VERSION_TAG\",
        \"name\": \"AI Live ISO $VERSION_TAG\",
        \"body\": \"Bootable NixOS live environment for diagnosing and fixing storage issues.\",
        \"draft\": false,
        \"prerelease\": false
    }")

# Check if release already exists
if echo "$RELEASE_RESPONSE" | grep -q '"message".*"already_exists"'; then
    echo "Release $VERSION_TAG already exists. Getting release ID..."
    RELEASE_ID=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO/releases/tags/$VERSION_TAG" | \
        python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    
    # Delete existing assets
    echo "Deleting existing assets..."
    ASSETS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO/releases/$RELEASE_ID/assets" | \
        python3 -c "import sys, json; [print(a['id']) for a in json.load(sys.stdin) if 'nixos-custom.iso' in a['name']]")
    
    for ASSET_ID in $ASSETS; do
        curl -s -X DELETE \
            -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/repos/$REPO/releases/assets/$ASSET_ID"
    done
else
    RELEASE_ID=$(echo "$RELEASE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
fi

echo "Uploading nixos-custom.iso.z01..."
curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/zip" \
    -T nixos-custom.iso.z01 \
    "https://uploads.github.com/repos/$REPO/releases/$RELEASE_ID/assets?name=nixos-custom.iso.z01" \
    -o /tmp/upload1.json

if [ $? -ne 0 ]; then
    echo "Error uploading part 1"
    exit 1
fi

echo "Uploading nixos-custom.iso.zip..."
curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/zip" \
    -T nixos-custom.iso.zip \
    "https://uploads.github.com/repos/$REPO/releases/$RELEASE_ID/assets?name=nixos-custom.iso.zip" \
    -o /tmp/upload2.json

if [ $? -ne 0 ]; then
    echo "Error uploading part 2"
    exit 1
fi

echo "Release $VERSION_TAG created/updated successfully!"
echo "Download URLs:"
echo "  Part 1: https://github.com/$REPO/releases/download/$VERSION_TAG/nixos-custom.iso.z01"
echo "  Part 2: https://github.com/$REPO/releases/download/$VERSION_TAG/nixos-custom.iso.zip"

