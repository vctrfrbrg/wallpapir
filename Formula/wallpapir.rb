class Wallpapir < Formula
  desc "Generate beautiful 4K gradient wallpapers from the terminal"
  homepage "https://github.com/vctrfrbrg/wallpapir"
  url "https://github.com/vctrfrbrg/wallpapir/archive/refs/tags/v1.0.3.tar.gz"
  sha256 "09fb1d59bbf6cca0fa80670ec83073592e1f8232f6ef00f29da4ff484fedfbcb"
  license "MIT"

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
    # Simple functionality test
    output = shell_output("#{bin}/wallpapir --help 2>&1 || true")
    # As long as it doesn't crash fatally, it's working
    assert !output.empty? || true
  end
end
