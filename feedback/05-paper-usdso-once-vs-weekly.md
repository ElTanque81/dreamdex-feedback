# Paper USDso: docs say "claim once", bounty page says "every week"

Severity: normal
Area: docs

## Steps to reproduce
1. Open the bounty page (dorahacks.io/hackathon/dreamdex-perps-bounty/detail), section "Testnet funds": joining the Perps Arena gives you paper USDso **every week**.
2. Open Developers > Perps on Testnet for Developers, section "Get test funds": any address can claim the 1,000 USDso perps credit **once**, as long as it holds no perp positions or orders.
3. Open Trading > Perps on Testnet, "Get started": joining Perps Arena gives you 1,000 paper USDso, with no mention of a weekly top-up.

## Expected
One consistent description of how much paper USDso a builder gets and how often, so bot builders can plan their test budget (and know whether `getPerpVoucherEligibility` will become `eligible` again).

## Actual
Three pages describe the credit differently: weekly (bounty page), once per address (developer docs), and a single 1,000 USDso grant without frequency (trader docs). The developer docs also say the claim requires holding no positions or orders, so it is unclear whether a weekly credit requires closing everything first, or arrives automatically.

## Evidence
Pages read on 2026-10-19:
- https://dorahacks.io/hackathon/dreamdex-perps-bounty/detail (Testnet funds)
- https://app.testnet.dreamdex.io/docs/developers/perps-testnet (Get test funds)
- https://app.testnet.dreamdex.io/docs/trading/perps-testnet (Get started)

## Environment
@somnia-chain/markets-sdk 0.32.1 (as referenced by the docs), Somnia Hideki (Tokyo) testnet, chain id 50383
