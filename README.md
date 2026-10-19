# dreamDEX Perps Builder Bounty – Feedback

Feedback-track submission for the dreamDEX Perps Builder Bounty (Somnia Hideki / Tokyo testnet).
Each issue is one file in `feedback/`. `repro.mjs` reproduces items 01–04 read-only; item 05 is a docs comparison (no wallet).

```
npm i viem @somnia-chain/markets-sdk@0.32.1
node repro.mjs
```

| # | Title | Severity | Area |
|---|-------|----------|------|
| 01 | Indexer markPrice/indexPrice 12–36 min stale, up to 1.7% off | major | API |
| 02 | Indexer rawMidpoint is 0 on every perp market | normal | API |
| 03 | Per-account position cap not a tenth (ZEC = 100% of OI cap) | major | contracts |
| 04 | Funding docs omit interest term and premium source | normal | docs |
| 05 | Paper USDso: "claim once" vs "every week" | normal | docs |
