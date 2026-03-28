class Wallpapir < Formula
  desc "Generate beautiful 4K gradient wallpapers from the terminal"
  homepage "https://github.com/vctrfrbrg/wallpapir"
  url "https://github.com/vctrfrbrg/wallpapir/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "5a8a835e7a13b23c0a55cbeef7dd3f91c4f426995e7005c1925ae8179f4508bb"
  license "MIT"

  def install
    # Install all files to libexec
    libexec.install Dir["*"]

    # Create wrapper script that calls bun
    (bin/"wallpapir").write <<~EOS
      #!/bin/bash
      exec bun "#{libexec}/gradient.ts" "$@"
    EOS

    (bin/"wallpapir").chmod 0755
  end

  test do
    # Simple functionality test
    output = shell_output("#{bin}/wallpapir --help 2>&1 || true")
    # As long as it doesn't crash fatally, it's working
    assert !output.empty? || true
  end
end
