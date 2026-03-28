class Wallpapir < Formula
  desc "Generate beautiful 4K gradient wallpapers from the terminal"
  homepage "https://github.com/vctrfrbrg/wallpapir"
  url "https://github.com/vctrfrbrg/wallpapir/archive/refs/tags/v1.0.4.tar.gz"
  sha256 "bc2f845bf7bb9ca5509e6843930a9acfc0f570e99b4cb20966515693882f0868"
  license "MIT"

  depends_on "oven-sh/bun/bun" => :runtime

  def install
    # Install all files to libexec
    libexec.install Dir["*"]

    # Create wrapper script that calls bun
    (bin/"wallpapir").write <<~EOS
      #!/bin/bash
      bun "#{libexec}/gradient.ts" "$@" 2> >(grep -v "registry.npmjs.org/@napi-rs" >&2)
    EOS

    (bin/"wallpapir").chmod 0755
  end

  test do
    assert_match "Generate beautiful", shell_output("#{bin}/wallpapir --help 2>&1")
  end
end
