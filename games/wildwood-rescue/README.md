# Wildwood Rescue

Static arcade cabinet build for the Wildwood Rescue prototype.

Source lives at `../../../wildwood-rescue`.

Controller fallback follows the arcade cabinet pattern:

- Browser-visible controllers are preferred.
- The first controller becomes P1.
- Extra controllers join with Start.
- `scripts/start-controller-bridge.sh` maps an 8BitDo-style controller into the keyboard fallback lane when the browser does not expose the pad.
