# RB5009 home-network series

A blog series logging a small home network on a MikroTik RB5009 behind
residential CGNAT. The series has one landing page and several focused
posts; the language below pins how those posts refer to each other and to
the two interchangeable ways of recovering routable IPv6.

## Language

**Index post**:
The series landing page at `/mikrotik-home-network/`. Owns cross-path
scaffolding only — overview, topology, address plan, path-choice matrix,
ULA-only update — and links out to every other post.
_Avoid_: "main post", "overview", "CGNAT post".

**VPS path**:
The IPv6-uplink recipe that uses a self-operated VPS to route a /48 over
WireGuard with eBGP. Lives in its own post at `/vps-ipv6-cgnat-mikrotik/`.
_Avoid_: "primary path", "the /48 path" (the prefix size is a property, not
the name).

**VyOS VPS variant**:
A variant of the **VPS path** where the self-operated relay runs VyOS
instead of Ubuntu + bird2 + nftables. Lives as a tab inside
`/vps-ipv6-cgnat-mikrotik/`. It is not a third equal path; it is an
implementation choice inside the self-operated VPS path.
_Avoid_: "third path", "VyOS path" unless the context is explicitly relay
implementation.

**Route64 path**:
The IPv6-uplink recipe that uses the free Route64 broker to route a /56
over WireGuard. Lives at `/route64-ipv6-cgnat-mikrotik/`.
_Avoid_: "fallback", "broker path", "the /56 path".

**Equal paths**:
The relationship between **VPS path** and **Route64 path**: peer choices
for getting a routable IPv6 prefix over residential CGNAT, not a primary
with a fallback. The reader picks one; everything else in the build is
identical either way.
_Avoid_: "primary and fallback", "default and alternative".

**Shared scaffolding**:
The path-agnostic mechanics that live in the **index post** instead of
being duplicated in each path post: topology and address plan (abstract
notation), shared placeholders, the path-choice matrix, the one-paragraph
verification pointer, and the §7 ULA-only trusted VLAN update.
_Avoid_: "common section", "shared chapter".

**Path post**:
Either **VPS path** or **Route64 path**. Owns its path-specific
placeholders, WireGuard client config, the address-plan substitution for
its prefix length, per-VLAN GUA/RDNSS snippet, IPv6 firewall + anti-spoof,
and full verification block.
_Avoid_: "alternative post", "sibling".

**Companion post**:
A focused post that any path can use but neither requires: VLAN
segmentation (Layer 1 foundation), encrypted DNS, UniFi controller on the
router, fast IPv6 failover (BGP+BFD).
_Avoid_: "sub-post", "appendix".

**Per-VLAN IPv6**:
The LAN-side configuration that gives each VLAN a GUA carved from the
routed prefix, a stable ULA, and RA RDNSS, with anti-spoof enforcement
on the IPv6 forward chain. Path-agnostic; lives in its own post at
`/mikrotik-per-vlan-ipv6/`. Plumbs a working routable-IPv6 default route
through to LAN clients.
_Avoid_: "the IPv6 firewall step", "the GUA section", "LAN-side IPv6",
"the per-VLAN GUA block".

## Relationships

- The **index post** points to every **path post** and every **companion post**.
- A **path post** points back to the **index post** for **shared scaffolding** and to **companion posts** for layers the build assumes.
- A **path post** ends by pointing at **Per-VLAN IPv6** as the next step — the routable-IPv6 default route it produces is not user-visible until that step runs.
- The two **path posts** are peers under the **equal paths** framing; they do not link to each other as primary/fallback, only as alternatives.
- The **VPS path** can present implementation tabs for Ubuntu/BIRD and the
  **VyOS VPS variant**, while preserving the same MikroTik-side
  BGP/WireGuard contract.
- **Per-VLAN IPv6** is path-agnostic — it sits after either **path post** and consumes the routed prefix using local per-VLAN /64 placeholders, with a substitution table mapping back to each path's prefix notation.
- The failover **companion post** extends the **VPS path** only (its BFD adds to the VPS path's BGP session). It can present Ubuntu/BIRD and VyOS implementation tabs, but it is not relevant to the **Route64 path**.

## Flagged ambiguities

- "CGNAT post" used to mean the old `post.mdx` (which was both index and
  VPS recipe in one file). Resolved: that file is now the **index post**;
  the VPS recipe is its own **path post**. Don't reuse the old name.
- "the IPv6 layer" was used to mean both the **VPS path** specifically and
  the union of both paths. Resolved: use the named path when meaning one,
  "the routable-IPv6 layer" when meaning the union.
