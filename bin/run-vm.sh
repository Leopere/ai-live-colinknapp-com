#!/bin/bash
set -e

ISO_FILE="nixos-custom.iso"

if [ ! -f "$ISO_FILE" ]; then
    echo "❌ ISO file '$ISO_FILE' not found. Please run ./bin/build.sh first."
    exit 1
fi

echo "🚀 Booting NixOS ISO in QEMU (x86_64)..."
echo "⚠️  Note: This uses software emulation (TCG) on Apple Silicon, so it will be slow."

# Run QEMU with x86_64 emulation
# -accel tcg,thread=multi : Use multi-threaded software emulation (best performance for x86 on ARM)
qemu-system-x86_64 \
    -m 4G \
    -smp 2 \
    -cdrom "$ISO_FILE" \
    -d cpu_reset \
    -display default \
    -vga virtio \
    -accel tcg,thread=multi
