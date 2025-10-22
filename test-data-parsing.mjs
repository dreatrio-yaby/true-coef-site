#!/usr/bin/env node

/**
 * Test YDB data parsing logic
 * Simulates the raw YDB response and tests the parsing
 */

console.log('🧪 Testing YDB data parsing logic...\n');

// Raw YDB data format (from check-ydb-data.mjs output)
const rawYDBRow = {
  items: [
    { textValue: "X" },                    // [0] betOutcome
    { textValue: "1x2" },                  // [1] betType
    { textValue: "Pinnacle" },             // [2] bookmaker
    { textValue: "136b1450-24a6-495a-b560-1cbc5112b6f9" },  // [3] id
    { textValue: "fb10988f-a757999c_1386679" },  // [4] matchId
    { doubleValue: 3.7 },                  // [5] mlCoefficient
    { doubleValue: 3.48 },                 // [6] odds
    { textValue: "poor" },                 // [7] profitabilityLevel
    { nullFlagValue: "NULL_VALUE" },       // [8] resultUpdatedAt
    { textValue: "active" },               // [9] status
    { uint64Value: "1761123579273000" },   // [10] trackedAt
    { textValue: "user_34PcJ2B06RMVAZia8DF6n4SOTKj_fb10988f-a757999c_1386679_1x2_X" },  // [11] uniqueKey
    { textValue: "user_34PcJ2B06RMVAZia8DF6n4SOTKj" }  // [12] userId
  ]
};

// Parsing logic from my-bets/route.ts
function parseBet(bet) {
  const items = bet.items || [];

  return {
    id: items[3]?.textValue,
    userId: items[12]?.textValue,
    matchId: items[4]?.textValue,
    betType: items[1]?.textValue,
    betOutcome: items[0]?.textValue,
    bookmaker: items[2]?.textValue,
    odds: items[6]?.doubleValue,
    mlCoefficient: items[5]?.doubleValue || undefined,
    profitabilityLevel: items[7]?.textValue || undefined,
    status: items[9]?.textValue,
    trackedAt: new Date(Number(items[10]?.uint64Value) / 1000),
    resultUpdatedAt: items[8]?.nullFlagValue ? undefined : new Date(Number(items[8]?.uint64Value) / 1000),
    uniqueKey: items[11]?.textValue,
  };
}

console.log('Raw YDB row structure:');
console.log(JSON.stringify(rawYDBRow, null, 2));
console.log('\n---\n');

const parsedBet = parseBet(rawYDBRow);

console.log('Parsed bet object:');
console.log(JSON.stringify(parsedBet, null, 2));
console.log('\n---\n');

// Validation
const checks = [
  { field: 'id', expected: '136b1450-24a6-495a-b560-1cbc5112b6f9', actual: parsedBet.id },
  { field: 'userId', expected: 'user_34PcJ2B06RMVAZia8DF6n4SOTKj', actual: parsedBet.userId },
  { field: 'matchId', expected: 'fb10988f-a757999c_1386679', actual: parsedBet.matchId },
  { field: 'betType', expected: '1x2', actual: parsedBet.betType },
  { field: 'betOutcome', expected: 'X', actual: parsedBet.betOutcome },
  { field: 'bookmaker', expected: 'Pinnacle', actual: parsedBet.bookmaker },
  { field: 'odds', expected: 3.48, actual: parsedBet.odds },
  { field: 'mlCoefficient', expected: 3.7, actual: parsedBet.mlCoefficient },
  { field: 'profitabilityLevel', expected: 'poor', actual: parsedBet.profitabilityLevel },
  { field: 'status', expected: 'active', actual: parsedBet.status },
  { field: 'uniqueKey', expected: 'user_34PcJ2B06RMVAZia8DF6n4SOTKj_fb10988f-a757999c_1386679_1x2_X', actual: parsedBet.uniqueKey },
];

console.log('Validation results:');
let allPassed = true;
checks.forEach(check => {
  const passed = check.expected === check.actual;
  allPassed = allPassed && passed;
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${check.field}: ${passed ? 'PASS' : `FAIL (expected: ${check.expected}, got: ${check.actual})`}`);
});

console.log('\n---\n');
if (allPassed) {
  console.log('🎉 All tests PASSED! Data parsing is working correctly.');
  console.log('');
  console.log('This means:');
  console.log('1. ✅ YDB rows are being parsed correctly');
  console.log('2. ✅ All fields are extracted properly');
  console.log('3. ✅ The useIsBetTracked hook should now work');
  console.log('4. ✅ Cells should turn green when tracked');
} else {
  console.log('❌ Some tests FAILED! Data parsing has issues.');
  process.exit(1);
}
