#!/bin/bash
set -e

echo "🚀 Starting Building NixOS ISO (x86_64-linux)..."
echo "This build runs inside OrbStack to handle x86_64 emulation and Nix sandbox requirements."

# Remove old ISO if it exists
if [ -f "./nixos-custom.iso" ]; then
    echo "🗑️  Removing old ISO..."
    rm -f ./nixos-custom.iso
fi

# Remove old result symlink if it exists
if [ -L "./result" ]; then
    rm -f ./result
fi

# Run the build inside OrbStack linux environment
# We use --option extra-platforms x86_64-linux to allow building x86 on ARM if needed (though it's slow)
orb run env NIXPKGS_ALLOW_UNFREE=1 nix \
    --extra-experimental-features "nix-command flakes" \
    build .#nixosConfigurations.live-iso.config.system.build.isoImage \
    --option extra-platforms x86_64-linux

echo "✅ Build complete. Extracting ISO..."

# Extract the ISO from the nix store result symlink to the local directory
orb run bash -c "cp -f \$(readlink -f result)/iso/*.iso ./nixos-custom.iso"

# Verify the ISO was created and show its size
if [ -f "./nixos-custom.iso" ]; then
    ISO_SIZE=$(ls -lh ./nixos-custom.iso | awk '{print $5}')
    echo "🎉 ISO available at: ./nixos-custom.iso (Size: $ISO_SIZE)"
    echo "💾 Ready for flashing with: sudo dd if=./nixos-custom.iso of=/dev/diskX bs=64M status=progress"
else
    echo "❌ ERROR: ISO file was not created!"
    exit 1
fi
