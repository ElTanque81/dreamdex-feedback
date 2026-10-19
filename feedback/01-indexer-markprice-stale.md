# Indexer Market.markPrice / indexPrice are 12-36 min stale and off by up to 1.7% from on-chain mark

Severity: major
Area: API

## Steps to reproduce
1. Query the indexer for all perp markets:
   `query { Market(where:{marketType:{_eq:"PERP"}}) { baseSymbol poolAddress markPrice indexPrice markPriceUpdatedAt fundingUpdatedAt lastTradeAt } }`
   against `https://hideki-dev.smk.somnia.host/v1/graphql`.
2. Compare `markPriceUpdatedAt` with the current time.
3. For each `poolAddress`, call `tryGetMarkPrice()` (selector `0xa8c485ca`) on the pool at `latest` via `https://api.hideki2.infra.testnet.somnia.network`.
4. Compare the indexer `markPrice` with the on-chain value.

`repro.mjs` in this repo runs all steps.

## Expected
`markPrice` / `indexPrice` on the market row track the chain within seconds (the pool's oracle staleness limit is 5 s, `maxOracleStalenessSec = 5`), as `listPerpMarkets()` rows are what bots and the docs tell builders to read.

## Actual
- `markPriceUpdatedAt` is always equal to `fundingUpdatedAt`: the row's mark/index only change when funding is updated, roughly every 15-35 minutes.
- Observed ages at 2026-10-19 18:30 UTC: 747 s (ETH) to 2,238 s (SOL), while the same markets had trades 4-120 s earlier (`lastTradeAt`).
- Deviation indexer mark vs on-chain `tryGetMarkPrice`: WLD +1.737%, NEAR +0.789%, PUMP +0.737%, ZEC +0.692%, AVAX +0.531%, SUI +0.506%, BTC +0.237%, ETH +0.216% (21 of 21 markets differ).
- On-chain `getIndexPrice()` on BTC returned `updatedAt` equal to the block timestamp, so the chain itself is fresh; only the indexer is stale.

Impact: anything that sizes orders, shows PnL or computes liquidation prices from the market row (bots built from the docs' `listPerpMarkets()` example, dashboards) works with prices that are off by up to ~1.7%. With 20x leverage that is a third of the maintenance margin.

## Evidence
BTC pool `0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0`, block 27828129 (ts 1792434649):
- on-chain `getMarkPrice()` = 81,732.54
- indexer `markPrice` = 81,955.65, `markPriceUpdatedAt` = 1792433503 (≈19 min old)

## Environment
@somnia-chain/markets-sdk 0.32.1, Somnia Hideki (Tokyo) testnet, chain id 50383, read-only (no wallet)
