# Per-VLAN IPv6 lives in its own post, not inside each path post

ADR-0001 concluded that each path post owns its own per-VLAN GUA/RDNSS
snippet and anti-spoof list because `<LAN_PREFIX>` (/48) and `<R64_56>`
(/56) placeholders don't string-substitute cleanly into a single shared
block. After living with the result, the duplication was real (~50 lines
in the VPS post, ~70 in the Route64 post) and the path posts were doing
two jobs: get a routable-IPv6 default route up, and plumb it through to
the LAN. The second job is identical between the two paths and benefits
from being a single focused post.

We decided to extract per-VLAN IPv6 (bridge LAN + per-VLAN GUA/ULA/RDNSS,
forward-chain inter-VLAN isolation, anti-spoof) into its own series step
at `/mikrotik-per-vlan-ipv6/`, sitting between the path posts and the
failover companion. ADR-0001's "per-path snippets" consequence is
explicitly revisited here.

## How we resolved the placeholder asymmetry

The new post defines three per-VLAN /64 placeholders locally —
`<GUA_LAN>`, `<GUA_IOT>`, `<GUA_GUEST>` — and a small substitution table
that maps each one back to its path's notation:

- From the VPS path: `<GUA_LAN>=<LAN_PREFIX>:1`, `<GUA_IOT>=<LAN_PREFIX>:10`,
  `<GUA_GUEST>=<LAN_PREFIX>:20`.
- From the Route64 path: `<GUA_LAN>=<R64_56>01`, `<GUA_IOT>=<R64_56>10`,
  `<GUA_GUEST>=<R64_56>20`.

The /48-vs-/56 detail is invisible to the snippet — the reader resolves
it once at the top. This is the trade-off ADR-0001 considered too messy
and rejected; the new shape (per-VLAN placeholders rather than a single
unified `<PREFIX>`) is what makes it clean.

## Consequences

- Each **path post** now ends at the relay-side setup with a "continue to
  Per-VLAN IPv6" pointer. The path post's verification block strips down
  to relay-side checks only (`birdc`, BGP session, tunnel ping).
- The index URL `/mikrotik-home-network/` is unaffected; the test-ipv6.run
  screenshot stays in index §7 as the one-glance path-agnostic check.
- Index §5 (ULA-only trusted VLAN30) stays where it is, as the post-build
  reflection. It cross-references the new post's anti-spoof pattern when
  defining VLAN30's own `vlan30-legit` list.
- The series grows from 7 posts to 8; SeriesNav slot 6 is the new post,
  failover and UniFi shift to 7 and 8.
- ADR-0001 is partially superseded — its "two-placeholder, per-path
  snippets" decision no longer holds for per-VLAN IPv6. Its core
  decision (VPS and Route64 are equal paths under a series index) is
  unchanged.
