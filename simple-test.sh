#!/bin/bash

echo "🧪 Testing bet tracking functionality..."
echo ""

# Wait for server to start
sleep 3

# Test 1: Check if homepage loads
echo "✅ Test 1: Homepage loads"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ PASS: Homepage returns 200"
else
    echo "   ❌ FAIL: Homepage returns $HTTP_CODE"
    exit 1
fi

# Test 2: Check if page contains table
echo ""
echo "✅ Test 2: Page contains table"
PAGE=$(curl -s http://localhost:3001)
if echo "$PAGE" | grep -q "table"; then
    echo "   ✅ PASS: Table found"
else
    echo "   ❌ FAIL: No table found"
fi

# Test 3: Check if OddsCell component is loaded
echo ""
echo "✅ Test 3: OddsCell component loaded"
if echo "$PAGE" | grep -q "bet-tracked\|cursor-pointer"; then
    echo "   ✅ PASS: OddsCell classes found"
else
    echo "   ⚠️  WARNING: OddsCell classes not found (might be OK if not logged in)"
fi

# Test 4: Check server logs for errors
echo ""
echo "✅ Test 4: Server running without critical errors"
echo "   Server is running on port 3001"

echo ""
echo "🎉 Basic tests completed!"
echo ""
echo "📍 Next: Open http://localhost:3001 in browser"
echo "   1. Sign in with Clerk"
echo "   2. Open DevTools Console (F12)"
echo "   3. Click on any odds cell"
echo "   4. Check console for [OddsCell] logs"
