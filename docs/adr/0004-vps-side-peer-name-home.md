# Naming the VPS-side peer `home`

The VPS-side recipes — Ubuntu/BIRD, MikroTik CHR, and VyOS — all need a
code-level identifier for the peer on the other end of the WireGuard +
eBGP session. That identifier shows up in many shapes: a BIRD
`protocol bgp <name>` block, a RouterOS WireGuard `peers/add name=…`,
RouterOS BGP `connection/add name=…` and `template/add name=…`, RouterOS
routing-filter chain names `bgp-in-…` / `bgp-out-…`, VyOS `peer <name>`,
VyOS BGP policy names, firewall rule descriptions, and placeholder
namespaces like `<…_AS>` / `<…_PUBKEY>` / `<…_ROUTER_ID>`.

Originally those slots all took the home box's vendor or device name —
`protocol bgp mikrotik`, WG peer `rb5009`, filter chains
`bgp-in-mikrotik`, placeholders `<MT_AS>` / `<MT_PUBKEY>` /
`<MT_ROUTER_ID>`. That made the snippets read as "this peer is _the_
MikroTik" — fine on a build where the home box is in fact a MikroTik
RB5009, awkward as soon as the CHR variant put MikroTik on _both_ ends
of the session, and actively misleading for any reader swapping the home
device for a hAP ax², a CCR2004, or a non-MikroTik router entirely.

`CONTEXT.md` §Casing also used those exact strings (`protocol bgp
mikrotik`, WG peer `rb5009`) as its canonical examples of "lowercase in
code only", which locked the casing rule to a vendor / device noun
instead of to the role the token actually plays.

## The decision

The VPS-side peer identifier is `home`, in both code and prose-as-side:

- BIRD: `protocol bgp home { … }`; verification reads `# learned from home`.
- RouterOS CHR (on the VPS): WireGuard peer `name=home`, BGP connection
  `name=home`, BGP template `tpl-home`, filter chains `bgp-in-home` /
  `bgp-out-home`, firewall comment `"BFD from home"`.
- VyOS (on the VPS): `set interfaces wireguard wg0 peer home …`, prefix-list
  `HOME-V6`, route-map `HOME-IN`, firewall description `'BFD from home'`.
- Placeholder namespaces: `<HOME_AS>`, `<HOME_PUBKEY>`, `<HOME_ROUTER_ID>`
  (replacing the previous `<MT_*>`).
- Prose on the VPS-side pages refers to the peer as "the home router" —
  not "the MikroTik" or "the RB5009" — even when the sentence is about
  RouterOS behavior. Vendor and hardware nouns survive only where the
  sentence depends on that property (e.g., a section that introduces the
  MikroTik CHR _product_, or one that observes an RB5009 hardware trait).

`CONTEXT.md` carries a `home router / home` glossary entry and the
§Casing example now uses `protocol bgp home` instead of `protocol bgp
mikrotik`.

This decision is scoped to the VPS-side `+variants` pages: the Ubuntu/
BIRD VPS post, the CHR VPS variant, the VyOS VPS variant, and the three
BFD failover companions. The home-side WG interface names (`wg-host`,
`wg-vps`) are unchanged — they are local to the home router and already
named for their role from the home perspective.

## Why not keep the device / vendor name

- **Misleading on CHR-both-ends.** When MikroTik runs on both sides of
  the tunnel, "the MikroTik" stops being a peer identifier and starts
  being a source of confusion. `home` and `chr-vps` stay unambiguous.
- **Brittle to device swap.** A reader replacing the home RB5009 with a
  hAP ax² or a CCR2004 had to rename every `mikrotik` / `rb5009` token —
  or accept a config full of lies about which box is on the other side.
- **Sits incorrectly inside ADR-0003.** That ADR pins MikroTik / RB5009 /
  RouterOS as three distinct meanings (vendor / hardware / OS). Using
  `mikrotik` or `rb5009` as a peer identifier conflates the peer's
  _role_ with the device's _vendor or hardware identity_, undermining
  the very distinction ADR-0003 enforces.

## Why `home` and not something else

- `lan` collides with the LAN VLANs already in the placeholder vocabulary
  (`<GUA_LAN>`, `vlan-lan`).
- `home-gw` is two tokens and reads badly in `protocol bgp home-gw` and
  `bgp-in-home-gw`.
- `client` overloads BGP route-reflector terminology.
- `home` is short, lowercase, neutral, already used informally in the
  prose ("the home aggregate", "the home network"), and pairs cleanly
  with the existing VPS-side names (`vps`, `chr-vps`, `vyos-vps`).

## Consequences

- **Portability.** The VPS-side recipes no longer encode any assumption
  about the home box's vendor or hardware in code-level identifiers.
- **Symmetry of perspective.** Each side names its peer by the peer's
  role: VPS calls home `home`; home calls the VPS `vps` / `chr-vps` /
  `vyos-vps` (already established). The labels are asymmetric because
  the perspectives are.
- **Upgrade friction for existing readers.** Anyone who pasted earlier
  versions of these snippets has live config using `mikrotik`/`rb5009`
  literals. Running the new snippets on top of the old ones will create
  _new_ peers/templates/chains, not overwrite the old ones — RouterOS
  and VyOS both treat the name as identity. An upgrader has to either
  remove the old entries first, or accept the new names alongside and
  flip the BGP connection over.
- **Slug ↔ identifier drift.** URLs and series titles still carry the
  `-mikrotik` brand-forward slugs (ADR-0003). That mismatch is accepted
  — the slug serves SEO, the identifier serves the recipe.
- **`CONTEXT.md` examples re-pinned.** The §Casing rule no longer uses
  `mikrotik`/`rb5009` as the canonical lowercase-in-code example; it
  now points at `protocol bgp home` and the `home` peer.
