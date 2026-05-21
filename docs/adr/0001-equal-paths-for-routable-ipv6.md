# VPS and Route64 are equal paths for routable IPv6, not primary/fallback

The home-network series needs to cover both ways of recovering routable
IPv6 behind CGNAT — a self-operated VPS routing a /48 over WireGuard+BGP,
and the free Route64 broker routing a /56 over WireGuard. The earlier
single-post structure (`post.mdx`) framed VPS as the build and Route64 as
an alternative footnote, which understated Route64 (no recurring cost, no
endpoint to operate, verified to traverse CGNAT) and overstated the VPS
path's defaults. We decided to treat the two as **equal paths**: peer
choices under a series **index post**, each in its own **path post**, with
a side-by-side decision matrix in the index. The reader picks one and
nothing else in the build changes.

## Considered options

- **Single post, VPS-primary with Route64 footnote.** The original
  shape. Rejected: it buried Route64's strengths and forced one
  combined verification block to serve two different recipes.
- **Single post, Route64-primary with VPS footnote.** Symmetric flip
  of the above; rejected for the same structural reason and because the
  VPS recipe carries more moving parts (BGP, return-routing, nftables,
  cost) that don't fit in a footnote.
- **Three posts, equal paths.** Chosen. Index owns shared scaffolding;
  each path owns its own recipe end-to-end including its own placeholder
  convention (`<LAN_PREFIX>` for the /48, `<R64_56>` for the /56).

## Consequences

- The index URL `/mikrotik-home-network/` stays put so external inbound
  links don't break; its content becomes the series landing page.
- Each path post owns its own per-VLAN GUA/RDNSS snippet and anti-spoof
  list, because the /48 and /56 placeholder conventions don't string-
  substitute cleanly across a single shared block.
- The §7 ULA-only trusted VLAN update lives in the index with broadened
  motivation: the datacenter-ASN streaming-flag argument applies to both
  paths, the metered-cap argument applies to VPS only.
- The failover companion post (BGP+BFD) is a child of the VPS path only;
  Route64 has its own netwatch fail-to-IPv4 inside its own post.
