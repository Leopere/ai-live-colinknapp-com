# NixOS Live ISO with Custom Boot Splash

A custom NixOS Live ISO featuring:
- **GNOME Desktop** with autologin
- **Custom boot splash** with logo
- **Direct boot** - no menu, straight to live environment
- **Firefox** web browser
- **Comprehensive filesystem tools** (NTFS, exFAT, BTRFS, XFS, HFS+, etc.)
- **Disk usage visualizers** (baobab, ncdu, duf, gdmap)
- **WiFi control** via NetworkManager
- **Cursor IDE** and **Antigravity IDE** pre-installed
- **Passwordless sudo** (password: `nixos`)

## Quick Start

### Download ISO

Visit the [GitHub Pages site](https://leopere.github.io/ai-live-colinknapp-com/) to download the latest ISO.

### Flash to USB

```bash
# Find your USB device
diskutil list

# Unmount and flash (replace /dev/diskX with your device)
sudo diskutil unmountDisk /dev/diskX
sudo dd if=nixos-custom.iso of=/dev/rdiskX bs=64M status=progress
sync
```

### Boot

1. Insert USB drive
2. Boot from USB (usually F12, F2, or Del during startup)
3. System boots directly into GNOME desktop
4. No login required - autologin enabled

## Building Locally

### Requirements

- Nix with flakes enabled
- OrbStack (for x86_64 emulation on ARM Macs)

### Build

```bash
./bin/build.sh
```

The ISO will be created at `./nixos-custom.iso`.

### Test in QEMU

```bash
# From ISO file
./bin/run-vm.sh

# From USB drive
./bin/run-hw-vm.sh
```

## Features

### Boot Configuration
- **No boot menu** - boots directly into live environment
- **Custom Plymouth splash** with logo during boot
- **Fast boot** - optimized for quick startup

### Desktop Environment
- **GNOME 49** with modern interface
- **Autologin** - no password prompt
- **Passwordless sudo** - password is `nixos` if needed

### Filesystem Support
- NTFS, exFAT, F2FS, BTRFS, XFS
- ext2/3/4, HFS+, JFS, ReiserFS, UDF
- All tools for disk management and recovery

### Development Tools
- **Cursor IDE** - AI-powered code editor
- **Antigravity IDE** - Modern development environment
- Git, curl, wget, and other essential tools

## Configuration

The ISO is built from `configuration.nix` using Nix flakes. Key configurations:

- User: `nixos` (password: `nixos`)
- Autologin: Enabled
- Sudo: Passwordless for wheel group
- Boot: Direct boot, no menu
- Plymouth: Custom theme with logo

## Repository Structure

```
.
├── configuration.nix      # NixOS system configuration
├── flake.nix              # Nix flake definition
├── plymouth-theme/        # Custom boot splash theme
│   ├── assets/            # Logo files
│   ├── plymouth.script    # Plymouth script
│   └── plymouth-theme.plymouth
├── bin/
│   ├── build.sh           # Build script
│   ├── run-vm.sh          # QEMU test from ISO
│   └── run-hw-vm.sh       # QEMU test from USB
└── README.md              # This file
```

## Building and Releasing

The ISO is built locally using `./bin/build.sh`. After building, upload the ISO to GitHub Releases manually, and the GitHub Pages site will automatically link to the latest release.

## License

This project uses NixOS, which is licensed under the MIT License.

