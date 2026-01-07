#!/bin/bash
set -e

DISK_DEVICE="/dev/disk4"
RAW_DISK_DEVICE="/dev/rdisk4"

echo "🚀 Attempting to boot QEMU from physical disk $DISK_DEVICE..."

# Check if disk exists
if [ ! -e "$DISK_DEVICE" ]; then
    echo "❌ Disk $DISK_DEVICE not found. Please check 'diskutil list'."
    exit 1
fi

# Unmount disk to allow QEMU access
echo "🔓 Unmounting disk..."
sudo diskutil unmountDisk "$DISK_DEVICE"

echo "🚀 Starting QEMU..."
echo "⚠️  Note: This uses software emulation (TCG). Hardware access via /dev/rdisk requires sudo."

# Run QEMU pointing to the physical drive
# -drive file=$RAW_DISK_DEVICE,format=raw,media=disk
sudo qemu-system-x86_64 \
    -m 4G \
    -smp 2 \
    -drive file="$RAW_DISK_DEVICE",format=raw,media=disk \
    -d cpu_reset \
    -display default \
    -vga virtio \
    -accel tcg,thread=multi
