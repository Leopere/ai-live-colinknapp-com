{
  description = "NixOS Live ISO with Cursor and Antigravity IDEs";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    antigravity.url = "github:jacopone/antigravity-nix";
  };

  outputs = { self, nixpkgs, antigravity, ... }@inputs: {
    nixosConfigurations.live-iso = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      specialArgs = { inherit inputs; };
      modules = [
        # Use minimal ISO base (GNOME added via configuration.nix)
        "${nixpkgs}/nixos/modules/installer/cd-dvd/installation-cd-minimal.nix"
        ./configuration.nix
      ];
    };
  };
}
