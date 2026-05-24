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

## Device, OS, vendor

Three terms, three meanings — pick the one whose property the sentence
actually depends on. Don't substitute them for variety. Rationale and
the slug/title mismatch are captured in
[ADR-0003](docs/adr/0003-naming-device-os-vendor.md).

**MikroTik**:
The vendor / brand / ecosystem. Use when the point is vendor-specific
(MikroTik docs, MikroTik forum, MikroTik's product family) or when
introducing the build to a reader who hasn't met the device yet.
_Avoid_: using "MikroTik" alone to mean the device in this build, or as
a synonym for RouterOS.

**RB5009**:
The specific hardware in this build — Cortex-A72 (ARMv8.0-A), 4× 2.5 GbE,
1× 10 GbE, SFP+ cage. Use when the sentence depends on a hardware
property: SFP+ port, CPU arch (ARMv8.0-A → which container images run),
PoE-in, the 10G uplink. Use also when the post is hardware-bound by
intent (per-VLAN IPv6 layered on this device's config).
_Avoid_: using "RB5009" when the recipe would work unchanged on any
RouterOS device (a hAP ax², a CCR2004…).

**RouterOS**:
The operating system / config language. Use when the recipe is
RouterOS-portable: `/interface bridge`, `/ip firewall filter`,
`/container`, scripts, the CLI grammar. Use for posts whose value is the
RouterOS configuration itself, not the box it runs on.
_Avoid_: "RouterOS" when the point is hardware (SFP+, CPU arch); avoid
abbreviating to "ROS" in our prose — that token only appears inside
upstream `help.mikrotik.com/docs/spaces/ROS/...` URLs.

**MikroTik RB5009**:
The full identifier. Use sparingly — on first introduction in a post
that needs the brand for SEO/clarity, or when the title's audience is
searching for "MikroTik RB5009" as a phrase.
_Avoid_: repeating the full phrase after first reference; pick RB5009
or RouterOS as the body settles into the recipe.

**Home router / `home`**:
The home-side peer in VPS-side recipes — the device originating the
home `/48` aggregate and terminating the WireGuard tunnel. Prose form
on VPS-side pages is "the home router"; code form is the bare token
`home` (BGP connection / template / WireGuard peer name, filter chains
`bgp-in-home` / `bgp-out-home`, VyOS prefix-list `HOME-V6` and
route-map `HOME-IN`, placeholders `<HOME_AS>` / `<HOME_PUBKEY>` /
`<HOME_ROUTER_ID>`). The rename from device/vendor labels
(`mikrotik` / `rb5009` → `home`) is captured in
[ADR-0004](docs/adr/0004-vps-side-peer-name-home.md).
_Avoid_: `mikrotik` or `rb5009` as code-level peer names in VPS-side
snippets; "the MikroTik" or "the RB5009" in VPS-side prose when
referring to the peer (those terms are reserved for vendor- or
hardware-property sentences).

**Title anchor rule**: pick the title's device/OS noun by what the
recipe is bound to, not by the slug.
- RouterOS-portable recipe (works on any RouterOS box) → title anchors
  on **RouterOS**. Applies to: VLANs, Per-VLAN IPv6, Encrypted DNS,
  Fast IPv6 failover.
- RB5009-bound by hardware (SFP+, CPU arch, port count) → title
  anchors on **RB5009**. Applies to: UniFi-on-router (ARMv8.0-A
  constraint), GPON SFP stick (SFP+ cage).
- Concept-first posts (index, VPS path, Route64 path) — no device
  anchor in the title; don't force one in.
- **MikroTik RB5009** (full phrase) is reserved for the series landing
  context, not individual post titles.

Slug/title mismatch is accepted: URL slugs are locked for SEO and were
written brand-forward (`-mikrotik`); titles follow the rule above.

**Series-anchor rule** (body first-mention):
- Hardware-bound posts and standalone entry points open with a
  one-sentence series anchor that includes the phrase "MikroTik RB5009"
  and links back to the index post — e.g., _"This is step N of a
  [MikroTik RB5009 home-network series](/mikrotik-home-network/)."_
  Applies to: UniFi-on-router, GPON SFP, VPS path, Route64 path.
- Other posts (VLANs, Per-VLAN IPv6, Encrypted DNS, Fast IPv6 failover)
  do not need an anchor sentence — they sit deeper in the series and
  the index post + slug carry the brand. Their lede leads with the
  recipe noun (RouterOS or RB5009) per the title-anchor rule.
- The index post is the anchor; it never anchors to itself.

**Link-text rule**:
- On navigation surfaces — the index post's TOC, path-choice matrix,
  related-posts block, and any "next/previous" footer — link text is
  the destination H1 verbatim. When an H1 changes, those links change
  with it.
- In inline prose — "see the VLAN companion post", "the BFD failover
  post explains…" — a free shortening is fine; don't re-state the full
  title mid-sentence.

**Casing**: `MikroTik` (brand caps), `RouterOS` (camelcase), `RB5009`
(uppercase). Lowercase forms appear only as URL slugs (locked for SEO)
and as identifier tokens in code — peer names, filter chains, BGP
template names — which use the side label, not the vendor or device:
`protocol bgp home`, WireGuard peer `home`, `bgp-in-home`/`bgp-out-home`,
`tpl-home`. Placeholder namespaces follow: `<HOME_AS>`, `<HOME_PUBKEY>`,
`<HOME_ROUTER_ID>`. See [home router](#home-router--home) and
[ADR-0004](docs/adr/0004-vps-side-peer-name-home.md) for why VPS-side
code does not use `mikrotik` or `rb5009`. Never use lowercase in prose or
headings.

## Flagged ambiguities

- "CGNAT post" used to mean the old `post.mdx` (which was both index and
  VPS recipe in one file). Resolved: that file is now the **index post**;
  the VPS recipe is its own **path post**. Don't reuse the old name.
- "the IPv6 layer" was used to mean both the **VPS path** specifically and
  the union of both paths. Resolved: use the named path when meaning one,
  "the routable-IPv6 layer" when meaning the union.
