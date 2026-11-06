import { describe, expect, it } from "vitest";
import { extractAppleMusicEmbed } from "@/components/ListeningMode";

describe("Apple Music embeds", () => {
  it("builds an embed URL from an HTTPS Apple Music link", () => {
    expect(extractAppleMusicEmbed("https://music.apple.com/us/album/example/123?i=456"))
      .toBe("https://embed.music.apple.com/us/album/example/123?i=456");
  });

  it("rejects attacker-controlled hosts, credentials, and schemes", () => {
    for (const url of [
      "https://evil.example/music.apple.com/us/album/example/123",
      "https://music.apple.com.evil.example/us/album/example/123",
      "https://user@music.apple.com/us/album/example/123",
      "http://music.apple.com/us/album/example/123",
      "javascript:music.apple.com/us/album/example/123",
    ]) expect(extractAppleMusicEmbed(url)).toBeNull();
  });
});
