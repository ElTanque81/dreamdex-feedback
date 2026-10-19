// Read-only reproduction for feedback items 01-04. Node 18+, no wallet needed.
// Usage: npm i viem @somnia-chain/markets-sdk@0.32.1 && node repro.mjs
import { createPublicClient, http, parseAbi } from "viem";
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";

const INDEXER = "https://hideki-dev.smk.somnia.host/v1/graphql";
const client = createPublicClient({ chain: hidekiTestnet, transport: http() });
const abi = parseAbi([
  "function tryGetMarkPrice() view returns (bool ok, uint256 price)",
  "function getIndexPrice() view returns (uint256 price, uint256 updatedAt)",
  "function getOpenInterest() view returns (uint256)",
  "function getCurrentFundingRate() view returns (int256)",
  "function getPerpPoolParameters() view returns ((uint256 initialMarginBps, uint256 maintenanceMarginBps, uint256 closeOutMarginBps, uint256 maxOpenInterest, uint256 maxPositionSize, uint256 takerFeeBpsTimes1k, int256 makerFeeBpsTimes1k, uint256 insuranceFundShareBps))",
  "function getFundingParameters() view returns ((uint256 fundingCalculationWindowSec, uint256 fundingSettlementIntervalSec, int256 interestRatePerWindow, uint256 maxFundingRatePerWindow, uint256 dampener, uint256 emaSmoothingAlpha, uint256 maxOracleStalenessSec))",
]);

const query = `query { Market(where:{marketType:{_eq:"PERP"}}) {
  baseSymbol poolAddress baseDecimals markPrice indexPrice rawMidpoint
  markPriceUpdatedAt fundingUpdatedAt fundingRate lastTradeAt } }`;
const res = await fetch(INDEXER, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query }),
});
const markets = (await res.json()).data.Market;
const block = await client.getBlock();
const now = Number(block.timestamp);
console.log(`block ${block.number} ts ${now} (${new Date(now * 1000).toISOString()})\n`);

const rows = [];
for (const m of markets) {
  const address = m.poolAddress;
  const [[, chainMark], [idx], oi, fr, pp, fp] = await Promise.all([
    client.readContract({ address, abi, functionName: "tryGetMarkPrice" }),
    client.readContract({ address, abi, functionName: "getIndexPrice" }),
    client.readContract({ address, abi, functionName: "getOpenInterest" }),
    client.readContract({ address, abi, functionName: "getCurrentFundingRate" }),
    client.readContract({ address, abi, functionName: "getPerpPoolParameters" }),
    client.readContract({ address, abi, functionName: "getFundingParameters" }),
  ]);
  const pct = (a, b) => ((Number(a) / Number(b) - 1) * 100).toFixed(3) + "%";
  rows.push({
    market: m.baseSymbol,
    // 01: indexer staleness and deviation
    idxMarkAgeS: now - Number(m.markPriceUpdatedAt),
    markUpdEqFundingUpd: m.markPriceUpdatedAt === m.fundingUpdatedAt,
    idxVsChainMark: pct(m.markPrice, chainMark),
    // 02: rawMidpoint
    rawMidpoint: m.rawMidpoint,
    // 03: per-account cap vs OI cap
    posCapShare: (Number(pp.maxPositionSize) / Number(pp.maxOpenInterest)).toFixed(3),
    oiUsed: ((Number(oi) / Number(pp.maxOpenInterest)) * 100).toFixed(1) + "%",
    // 04: funding sign vs mark/index
    markVsIndex: pct(chainMark, idx),
    fundingPerWindow: ((Number(fr) / 1e18) * 100).toFixed(4) + "%",
    interestPerWindow: ((Number(fp.interestRatePerWindow) / 1e18) * 100).toFixed(4) + "%",
  });
}
console.table(rows);
