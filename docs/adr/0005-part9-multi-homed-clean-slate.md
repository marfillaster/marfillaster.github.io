# Part 9 — multi-homed IPv6 is a clean-slate post, not a renumber sequel

Part 9 ("Multi-homing IPv6 over CGNAT on RouterOS") replaces the WAN-side
plumbing of Parts 4 (VPS) and 5 (Route64) with a single self-contained
multi-homed build under one announceable /48, rather than walking readers
through a renumber from the earlier path-specific addressing. Parts 4 and
5 remain as friction-low standalone reads for the single-uplink case;
readers who want multi-homing follow Part 9 directly, with an ASN and an
announceable /48 as hard prerequisites. The "equal paths" framing from
[ADR-0001](0001-equal-paths-for-routable-ipv6.md) is preserved for Parts 4
and 5; the primary/backup reframe is local to Part 9.
