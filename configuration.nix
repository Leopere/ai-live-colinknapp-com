{ config, pkgs, inputs, lib, ... }:

{
  # Allow unfree packages for Cursor and Antigravity IDE
  nixpkgs.config.allowUnfree = true;

  # Enable experimental features for flakes
  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  # Enable filesystem kernel modules
  boot.supportedFilesystems = [
    "ntfs"
    "vfat"
    "exfat"
    "ext4"
    "ext3"
    "ext2"
    "btrfs"
    "xfs"
    "jfs"
    "reiserfs"
    "f2fs"
    "hfsplus"
    "hfs"
    "udf"
    "nilfs2"
  ];

  # Boot directly into live environment - no boot menu
  # Use mkForce to override ISO module's default timeout of 10
  boot.loader.timeout = lib.mkForce 0;
  boot.loader.grub.splashImage = null;  # Disable GRUB splash to go straight to Plymouth
  
  # For ISO boot (isolinux), ensure direct boot without menu
  boot.loader.grub.timeoutStyle = "hidden";  # Hide GRUB menu completely

  # Custom boot splash screen (Plymouth) with custom logo
  boot.plymouth = {
    enable = true;
    theme = "custom-logo";
    
    # Create custom Plymouth theme package with your logo
    themePackages = [
      (pkgs.stdenv.mkDerivation {
        name = "custom-plymouth-theme";
        src = ./plymouth-theme;
        installPhase = ''
          mkdir -p $out/share/plymouth/themes/custom-logo
          # Plymouth requires the .plymouth file to match the theme directory name
          cp plymouth-theme.plymouth $out/share/plymouth/themes/custom-logo/custom-logo.plymouth
          cp plymouth.script $out/share/plymouth/themes/custom-logo/plymouth.script
          cp assets/logo.png $out/share/plymouth/themes/custom-logo/logo.png
        '';
      })
    ];
  };

  # Configure the user with password "nixos"
  # Use mkForce to override ISO defaults
  users.users.nixos = lib.mkOverride 50 {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" "audio" "video" ];
    initialPassword = "nixos";
    initialHashedPassword = null; # Clear the ISO default
  };

  # Passwordless sudo for wheel group
  security.sudo = {
    enable = true;
    wheelNeedsPassword = false;
    extraRules = [{
      groups = [ "wheel" ];
      commands = [{ command = "ALL"; options = [ "NOPASSWD" ]; }];
    }];
  };

  # Networking with WiFi support
  networking.networkmanager.enable = true;
  networking.wireless.enable = lib.mkForce false; # Use NetworkManager instead

  # Desktop Environment (GNOME) + Autologin
  services.xserver.enable = true;
  services.displayManager.gdm.enable = true;
  services.desktopManager.gnome.enable = true;
  # Configure autologin
  services.displayManager.autoLogin = {
    enable = true;
    user = "nixos";
  };

  # Disable GNOME bloat for lighter ISO
  environment.gnome.excludePackages = with pkgs; [
    gnome-tour
    gnome-music
    epiphany # We'll use Firefox instead
    geary
    gnome-calendar
    gnome-contacts
    gnome-maps
    gnome-weather
    totem
  ];

  # System Packages
  environment.systemPackages = with pkgs; [
    # Web Browser
    firefox
    
    # Filesystem Management
    gparted
    parted
    gptfdisk
    util-linux
    dosfstools
    mtools
    
    # NTFS Support
    ntfs3g
    ntfsprogs
    
    # Additional Filesystem Support
    exfatprogs  # exFAT (USB drives, SD cards)
    f2fs-tools  # F2FS (flash storage)
    btrfs-progs  # BTRFS
    xfsprogs  # XFS
    e2fsprogs  # ext2/3/4
    hfsprogs  # HFS+ (macOS)
    jfsutils  # JFS
    reiserfsprogs  # ReiserFS
    udftools  # UDF (DVD/Blu-ray)
    
    # Disk Usage Visualization (WinDirStat-like)
    baobab  # GNOME Disk Usage Analyzer (GUI tree map)
    ncdu  # Terminal-based disk usage analyzer
    duf  # Modern disk usage/free space utility
    gdmap  # Alternative GUI disk usage visualizer
    
    # Network & WiFi Tools
    iperf3
    nmap
    dig
    tcpdump
    mtr
    ethtool
    networkmanagerapplet  # WiFi GUI control
    wpa_supplicant
    iw
    
    # General Utils
    git
    wget
    curl
    htop
    neofetch
    ripgrep
    fd

    # IDEs
    code-cursor
    inputs.antigravity.packages.${pkgs.system}.default
  ];

  # Automount the storage partition if it exists
  fileSystems."/home/nixos/storage" = {
    device = "/dev/disk/by-label/STORAGE";
    fsType = "auto";
    options = [ "nofail" "rw" "user" "uid=1000" ];
  };

  # Ensure the mount point exists with correct permissions
  systemd.tmpfiles.rules = [
    "d /home/nixos/storage 0755 nixos users -"
  ];

  # Optional: Optimizations for the IDEs
  services.sysprof.enable = true;

  # Workaround for GNOME autologin issue
  systemd.services."getty@tty1".enable = false;
  systemd.services."autovt@tty1".enable = false;
}
