# Naming the device, the OS, and the brand

The series mixes three nouns — **MikroTik** (vendor), **RB5009** (the
specific hardware), and **RouterOS** (the operating system / config
language) — and earlier posts used them somewhat interchangeably. Titles
oscillated between "MikroTik RB5009", "RouterOS", "RB5009", and no
device anchor at all; link text from the index post sometimes matched
the destination H1 and sometimes paraphrased it; some posts opened with
a series anchor in the lede and others didn't.

The published URL slugs were chosen brand-forward
(`-mikrotik`, `-routeros`) and are not moving — they have inbound links
and SEO history we don't want to churn. That means the slugs and the
nouns we use in titles and prose are decoupled, and we needed a rule
for the prose side that doesn't try to drag the slugs with it.

We decided to pin the three terms as distinct meanings, drive title
anchors off what the recipe is actually bound to, and accept slug/title
mismatch as the cost of leaving URLs alone.

## The three-term rule

- **MikroTik** is the vendor/brand. Use when the point is brand or
  ecosystem (MikroTik docs, the series identity), not as a synonym for
  the device or the OS.
- **RB5009** is the specific hardware. Use when the sentence depends on
  a hardware property — SFP+ cage, ARMv8.0-A CPU, the 10G uplink, port
  count — or when the post's value is hardware-bound by intent.
- **RouterOS** is the OS / config language. Use when the recipe is
  RouterOS-portable: it would work unchanged on a hAP ax², a CCR2004,
  or any other RouterOS box. Most of the series falls here.
- **MikroTik RB5009** (full phrase) is reserved for the series landing
  context and standalone-entry-point ledes; it doesn't belong in
  individual post titles or as a body refrain.

We considered (and rejected) two alternatives. The first was banning
all three terms in favour of one canonical phrase ("MikroTik RB5009")
everywhere — uniform but inaccurate (the UniFi post is genuinely about
the RB5009's CPU; the DNS post is genuinely about RouterOS), and it
flattens information the reader can use. The second was letting authors
pick freely with no rule — that's the state we were trying to fix.

## Title anchors track recipe-binding, not the slug

A post's title anchors on **RouterOS** when the recipe is
RouterOS-portable, on **RB5009** when the recipe is hardware-bound, and
on neither when the post is concept-first (the index, the two path
posts). Concretely:

- RouterOS-anchored titles: VLANs, Per-VLAN IPv6, Encrypted DNS, Fast
  IPv6 failover.
- RB5009-anchored titles: UniFi-on-router (Mongo 4.4.18 needs
  ARMv8.0-A — the RB5009's Cortex-A72 lacks the atomics the newer
  builds require), GPON SFP (the SFP+ cage is the whole point).
- No device anchor: index, VPS path, Route64 path.

The visible shifts from earlier titles are: the VLANs post moves from
"on a MikroTik RB5009" to "on RouterOS"; the Per-VLAN IPv6 post moves
from "on the RB5009" to "on RouterOS"; the UniFi-on-router post moves
from "on the router itself" to naming the RB5009; the GPON SFP post
picks up "RB5009" where it had nothing.

The VLANs retitle is the largest visible change and the one with a real
trade-off: "MikroTik RB5009" is more brand-searchable, but the recipe
runs unchanged on any RouterOS box and the slug already carries the
brand for SEO. We chose portability honesty in the title and let the
slug do the brand work.

## Slug/title mismatch is accepted

`encrypted-dns-stable-resolver-mikrotik` lives next to an H1 of
"…on RouterOS"; `mikrotik-per-vlan-ipv6` lives next to "Per-VLAN IPv6
on RouterOS". A contributor noticing this will be tempted to "fix" it
by either renaming the slug (breaking URLs) or retitling back to
"MikroTik" (re-introducing the inconsistency this ADR resolved). Don't
do either — the mismatch is the deliberate output of leaving URLs alone
while applying the recipe-binding rule to titles.

## Link text follows H1 on nav surfaces, free-form inline

Two kinds of cross-reference, two rules:

- On **navigation surfaces** — the index post's TOC, the path-choice
  matrix, the related-posts block, the next/previous footer — link text
  is the destination H1 verbatim. When an H1 changes, every nav link to
  it updates with it. This is mechanical and greppable.
- In **inline prose** — "see the VLAN companion post", "the BFD failover
  post explains…" — a free shortening is fine and usually reads better
  than re-stating the full title mid-sentence.

The strict-everywhere alternative (verbatim H1 even inline) was
rejected as too clunky in prose; the free-everywhere alternative was
rejected because navigation surfaces are exactly where readers scan for
titles, and a mismatch there is the most visible kind.

## Standalone-entry posts open with a series anchor

Some posts in the series are entry points — readers land on them cold
from search. Hardware-bound posts and the two path posts are the
biggest such surfaces. Those posts open with a one-sentence anchor that
includes the full phrase **MikroTik RB5009** and links to the index,
e.g., _"This is step N of a [MikroTik RB5009 home-network
series](/mikrotik-home-network/)."_

Posts that sit deeper in the series — VLANs, Per-VLAN IPv6, Encrypted
DNS, Fast IPv6 failover — don't need the anchor sentence. Readers who
land on them typically arrived via the index or a path post, and their
lede leads with the recipe noun (RouterOS or RB5009) per the
title-anchor rule.

We considered anchoring every post (uniform but boilerplate, and the
deeper posts already carry context from the slug and the surrounding
series) and anchoring no post (clean but loses brand context for
drop-in readers on the biggest SEO surfaces). The hybrid is what we
landed on.

## Consequences

- Title edits land on: VLANs, Per-VLAN IPv6, UniFi-on-router, GPON SFP.
  Existing RouterOS-titled posts (Encrypted DNS, Fast IPv6 failover) and
  concept-first titles (index, VPS path, Route64 path) stay put.
- The index post's navigation link text to the four retitled posts
  updates verbatim to the new H1s.
- The VPS path, Route64 path, UniFi-on-router, and GPON SFP posts gain
  (or, where present, normalise) a one-sentence series-anchor lede.
- Lowercase `mikrotik` / `routeros` / `rb5009` remain in URL slugs and
  in code-block identifiers (BGP peer-names, WireGuard peer-names) —
  those are tokens, not prose. They do not appear in body text or
  headings.
- We do not abbreviate to `ROS` in our prose; the only `ROS` token in
  the repo is inside `help.mikrotik.com/docs/spaces/ROS/...` URLs, which
  is upstream's convention.
- CONTEXT.md carries the glossary form of these rules. This ADR is the
  rationale.
