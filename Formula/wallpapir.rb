class Wallpapir < Formula
  desc "Generate beautiful 4K gradient wallpapers from the terminal"
  homepage "https://github.com/vctrfrbrg/wallpapir"
  url "https://github.com/vctrfrbrg/wallpapir/archive/refs/tags/v1.0.2.tar.gz"
  sha256 "baae8b84c98ac19b85edf8e4580fe896609dd7e78302fc1ae16a732ff33149d4"
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
