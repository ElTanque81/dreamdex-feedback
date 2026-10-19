# Indexer Market.rawMidpoint is 0 for every perp market

Severity: normal
Area: API

## Steps to reproduce
1. Query `https://hideki-dev.smk.somnia.host/v1/graphql`:
   `query { Market(where:{marketType:{_eq:"PERP"}}) { baseSymbol rawMidpoint lastPrice lastTradeAt } }`
2. Look at `rawMidpoint`.

## Expected
`rawMidpoint` holds the book midpoint (it is part of the SDK's `MarketFields` fragment, so it surfaces on every `listPerpMarkets()` row), or the field is null / removed if it is not indexed for perps.

## Actual
`rawMidpoint` is `"0"` on all 21 perp markets, including liquid ones with trades seconds earlier (e.g. LINK last trade 4 s before the query, BTC `lastPrice` 82,090.7). A consumer cannot tell "no midpoint" from "midpoint of 0".

## Evidence
Query at 2026-10-19 ~18:30 UTC, `chain_metadata.latest_processed_block` = 27827039. Every row returned `rawMidpoint: "0"`.

## Environment
@somnia-chain/markets-sdk 0.32.1, Somnia Hideki (Tokyo) testnet, chain id 50383, read-only
