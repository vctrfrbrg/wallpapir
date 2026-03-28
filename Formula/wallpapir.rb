class Wallpapir < Formula
  desc "Generate beautiful 4K gradient wallpapers from the terminal"
  homepage "https://github.com/vctrfrbrg/wallpapir"
  url "https://github.com/vctrfrbrg/wallpapir/archive/refs/tags/v1.0.6.tar.gz"
  sha256 "fad091359249780b69f2a1f9a2821a963a74f6ff078f3100befd971ee1fdf52a"
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
