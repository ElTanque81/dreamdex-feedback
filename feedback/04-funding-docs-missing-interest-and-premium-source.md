# Funding docs omit the interest-rate component and say the sign follows perp vs index, which live data contradicts

Severity: normal
Area: docs

## Steps to reproduce
1. Read Trading > Perps (Testnet) > Funding: "Perp above the index (positive funding): longs pay shorts. Perp below the index (negative funding): shorts pay longs." No other component is described.
2. Call `getFundingParameters()` (selector `0xb8c5b9b1`) on any perp pool.
3. Query the indexer for `markPrice`, `indexPrice`, `fundingRate` on all perp markets, and call `getMarkPrice()`, `getIndexPrice()`, `getCurrentFundingRate()`, `getLastObservedPremium()` on the BTC pool.

## Expected
The docs describe how the rate is actually computed, so a trader can predict who pays.

## Actual
- `getFundingParameters()` returns `interestRatePerWindow = 0.0001` (0.01% per 8 h), `maxFundingRatePerWindow = 0.04` (4%), `dampener = 0.0005`, `emaSmoothingAlpha = 0.5`. None of these are in the docs.
- Because of the interest term, 14 of 21 markets showed exactly +0.0100% funding (longs pay) while their mark was **below** the index (e.g. ETH mark -0.043% vs index, SOL -0.044%, ADA -0.092%), the opposite of what the docs say.
- BTC: on-chain mark 81,732.54 < index 81,764.13, yet `getCurrentFundingRate()` = +0.1664% per window and `getLastObservedPremium()` = +0.399%. The premium is clearly measured from something other than the mark (book impact price / trades), which the docs do not say. A trader reading "perp below index → shorts pay longs" would expect to be paid as a long here and is charged instead.

Suggested fix: document the formula (premium source, EMA/TWAP, dampener, interest rate, clamp) and that a +0.01% floor-like interest applies when premium ≈ 0.

## Evidence
BTC pool `0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0`, block 27828129 (2026-10-19 18:30 UTC). Decoded `getFundingParameters()`: window 28800 s, interval 3600 s, interest 1e14, maxRate 4e16, dampener 5e14, ema 5e17, maxOracleStalenessSec 5.

## Environment
@somnia-chain/markets-sdk 0.32.1, Somnia Hideki (Tokyo) testnet, chain id 50383, read-only
