# Per-account position cap is not "a tenth of the OI cap": ZEC lets one account take 100% of market open interest

Severity: major
Area: contracts

## Steps to reproduce
1. For each perp pool, call `getPerpPoolParameters()` (selector `0x35a15b24`) and read `maxOpenInterest` (field 4) and `maxPositionSize` (field 5).
2. Compute `maxPositionSize / maxOpenInterest`.

## Expected
Per the docs ("Perps on Testnet", and the developer page's Common pitfalls): a single account is capped at a tenth of the market's open interest cap on most markets.

## Actual
Ratio `maxPositionSize / maxOpenInterest` on 2026-10-19:
- 1.0: **ZEC** (maxPositionSize = maxOpenInterest = 420 ZEC)
- 0.405: BTC (100 BTC of 246.81545 BTC)
- ~0.2: LINK, XRP, DOGE, SUI, BNB, AVAX, XLM, ADA, NEAR
- 0.1: 1000PEPE, SOL, WLD, TAO, PUMP, LIT, ZRO, HYPE, VVV, ETH

So only 10 of 21 markets match the documented tenth. On ZEC a single account can open the entire market-wide OI cap, after which every other account's position-increasing orders hit the OI cap. On BTC, OI was already at 86.5% of the cap (213.46 / 246.82 BTC), so one account could fill the remainder.

Either the parameters are misconfigured (ZEC looks like it, since the cap equals the market cap exactly) or the docs need to state the real per-market values (and `getMaxPerpOrderSize().maxPositionSize` is the only way to learn them).

## Evidence
BTC pool `0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0`, block 27828129: `getPerpPoolParameters()` → IM 500 bps, MM 250, CM 125, maxOpenInterest 24,681,545,000 (246.81545 BTC), maxPositionSize 10,000,000,000 (100 BTC). `getOpenInterest()` → 213.45569 BTC.

`repro.mjs` prints the ratio for all 21 markets.

## Environment
@somnia-chain/markets-sdk 0.32.1, Somnia Hideki (Tokyo) testnet, chain id 50383, read-only
