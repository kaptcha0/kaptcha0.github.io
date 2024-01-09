let
  nixpkgs = <nixpkgs>;
  pkgs = import nixpkgs { config = {}; overlays = []; };
in

pkgs.mkShell {
  packages = with pkgs; [
    nodejs
    gcc
    clang
    ruby
  ];

  shellHook = ''
    bundle
  '';
}