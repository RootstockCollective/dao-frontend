#!/bin/bash

# Script to fund a wallet with USDT0 tokens and RBTC on Anvil fork
# Usage: ./scripts/fund-usdt0.sh <YOUR_WALLET_ADDRESS> [USDT0_AMOUNT] [RBTC_AMOUNT]
# Example: ./scripts/fund-usdt0.sh 0x1234...abcd 1000 10
#
# Dependencies: curl, bc (both are standard on macOS/Linux)

WALLET_ADDRESS=$1
AMOUNT=${2:-1000}      # Default 1,000 USDT0
RBTC_AMOUNT=${3:-10}   # Default 10 RBTC

if [ -z "$WALLET_ADDRESS" ]; then
  echo "❌ Error: Wallet address required"
  echo "Usage: ./scripts/fund-usdt0.sh <WALLET_ADDRESS> [USDT0_AMOUNT] [RBTC_AMOUNT]"
  echo "Example: ./scripts/fund-usdt0.sh 0x1234...abcd 1000 10"
  exit 1
fi

RPC_URL="http://127.0.0.1:8545"
USDT0_ADDRESS="0x779Ded0c9e1022225f8E0630b35a9b54bE713736"

# USDT0 has 6 decimals, so multiply by 10^6
AMOUNT_WEI=$(echo "$AMOUNT * 1000000" | bc)
# Pad to 32 bytes (64 hex chars) for anvil_setStorageAt
AMOUNT_HEX=$(printf "0x%064x" $AMOUNT_WEI)

echo "💰 Funding wallet $WALLET_ADDRESS with $AMOUNT USDT0 and $RBTC_AMOUNT RBTC..."
echo ""

# Helper function for RPC calls using curl
rpc_call() {
  local method=$1
  local params=$2
  curl -s -X POST "$RPC_URL" \
    -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"$method\",\"params\":$params,\"id\":1}"
}

# Helper to convert decimal to hex (works for large numbers)
dec_to_hex() {
  local dec=$1
  # Use bc to convert decimal to hex
  echo "obase=16; $dec" | bc | tr '[:upper:]' '[:lower:]'
}

# Step 1: Fund wallet with RBTC
echo "1️⃣ Adding $RBTC_AMOUNT RBTC to wallet..."

# Convert RBTC to wei (multiply by 10^18) - use bc for precision
RBTC_WEI=$(echo "$RBTC_AMOUNT * 1000000000000000000" | bc | cut -d'.' -f1)
RBTC_WEI_HEX="0x$(dec_to_hex $RBTC_WEI)"

echo "   Setting balance to $RBTC_WEI wei ($RBTC_WEI_HEX)"

SET_BALANCE_RESULT=$(rpc_call "anvil_setBalance" "[\"$WALLET_ADDRESS\", \"$RBTC_WEI_HEX\"]")

# anvil_setBalance returns {"jsonrpc":"2.0","id":1,"result":null} on success
# Check if there's an error field
if echo "$SET_BALANCE_RESULT" | grep -q '"error"'; then
  echo "   ❌ Failed to add RBTC"
  echo "   Response: $SET_BALANCE_RESULT"
else
  echo "   ✅ Successfully set RBTC balance!"
fi
echo ""

# Step 2: Fund wallet with USDT0
echo "2️⃣ Adding $AMOUNT USDT0 to wallet..."
echo ""

# Use storage manipulation method directly (most reliable)
echo "   Using storage manipulation to set balance..."

# USDT0 is an upgradeable ERC20 (OpenZeppelin ERC20Upgradeable)
# The balances mapping is at storage slot 51
BALANCE_SLOT=51

# Calculate storage key using web3_sha3 RPC call
# Encode: address (32 bytes, left-padded) + slot (32 bytes)
WALLET_LOWER=$(echo "$WALLET_ADDRESS" | tr '[:upper:]' '[:lower:]')
WALLET_NO_PREFIX=${WALLET_LOWER#0x}
WALLET_PADDED=$(printf "%064s" "$WALLET_NO_PREFIX" | tr ' ' '0')
SLOT_PADDED=$(printf "%064x" $BALANCE_SLOT)
ENCODED_DATA="0x${WALLET_PADDED}${SLOT_PADDED}"

# Use web3_sha3 (keccak256) RPC call
SHA3_RESULT=$(rpc_call "web3_sha3" "[\"$ENCODED_DATA\"]")
STORAGE_KEY=$(echo "$SHA3_RESULT" | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')

if [ -z "$STORAGE_KEY" ]; then
  echo "   ❌ Failed to calculate storage key"
  echo "   Response: $SHA3_RESULT"
  exit 1
fi

echo "   Balance slot: $BALANCE_SLOT"
echo "   Storage key: $STORAGE_KEY"
echo "   Amount: $AMOUNT_WEI wei ($AMOUNT USDT0)"

# Set the storage value
SET_STORAGE_RESULT=$(rpc_call "anvil_setStorageAt" "[\"$USDT0_ADDRESS\", \"$STORAGE_KEY\", \"$AMOUNT_HEX\"]")

if echo "$SET_STORAGE_RESULT" | grep -q '"error"'; then
  echo "   ❌ Failed to set USDT0 storage"
  echo "   Response: $SET_STORAGE_RESULT"
  exit 1
else
  echo "   ✅ Successfully set USDT0 balance!"
fi

echo ""

# Step 3: Mine a block to commit state changes (required for MetaMask to see the balance)
echo "3️⃣ Mining a block to commit state changes..."
MINE_RESULT=$(rpc_call "evm_mine" "[]")
if echo "$MINE_RESULT" | grep -q '"error"'; then
  echo "   ⚠️  Warning: Could not mine block"
else
  echo "   ✅ Block mined successfully!"
fi
echo ""

# Step 4: Verify balances
echo "4️⃣ Verifying balances..."

# Verify RBTC balance
RBTC_RESULT=$(rpc_call "eth_getBalance" "[\"$WALLET_ADDRESS\", \"latest\"]")
RBTC_HEX=$(echo "$RBTC_RESULT" | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')

if [ -n "$RBTC_HEX" ] && [ "$RBTC_HEX" != "0x0" ]; then
  # Convert hex to decimal using bc
  RBTC_HEX_CLEAN=${RBTC_HEX#0x}
  RBTC_WEI_RESULT=$(echo "ibase=16; $(echo $RBTC_HEX_CLEAN | tr '[:lower:]' '[:upper:]')" | bc)
  RBTC_ETH=$(echo "scale=4; $RBTC_WEI_RESULT / 1000000000000000000" | bc)
  echo "   ✅ RBTC balance: $RBTC_ETH RBTC"
else
  echo "   ⚠️  RBTC balance: 0 or could not verify"
  echo "   Raw response: $RBTC_RESULT"
fi

# Verify USDT0 balance
WALLET_NO_PREFIX_LOWER=$(echo "${WALLET_ADDRESS#0x}" | tr '[:upper:]' '[:lower:]')
BALANCE_OF_DATA="0x70a08231000000000000000000000000${WALLET_NO_PREFIX_LOWER}"
BALANCE_RESULT=$(rpc_call "eth_call" "[{\"to\":\"$USDT0_ADDRESS\",\"data\":\"$BALANCE_OF_DATA\"}, \"latest\"]")
BALANCE_HEX=$(echo "$BALANCE_RESULT" | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')

if [ -n "$BALANCE_HEX" ] && [ "$BALANCE_HEX" != "0x" ] && [ "$BALANCE_HEX" != "0x0" ]; then
  BALANCE_HEX_CLEAN=${BALANCE_HEX#0x}
  # Remove leading zeros for bc
  BALANCE_HEX_CLEAN=$(echo $BALANCE_HEX_CLEAN | sed 's/^0*//')
  if [ -z "$BALANCE_HEX_CLEAN" ]; then
    BALANCE_DECIMAL=0
  else
    BALANCE_DECIMAL=$(echo "ibase=16; $(echo $BALANCE_HEX_CLEAN | tr '[:lower:]' '[:upper:]')" | bc)
  fi
  BALANCE_USDT0=$(echo "scale=2; $BALANCE_DECIMAL / 1000000" | bc)
  echo "   ✅ USDT0 balance: $BALANCE_USDT0 USDT0"
else
  echo "   ⚠️  USDT0 balance: 0 or could not verify"
fi

echo ""
echo "💡 Done! Your wallet should now have $AMOUNT USDT0 and $RBTC_AMOUNT RBTC."
echo ""
echo "If balances don't show in MetaMask, try:"
echo "   1. Settings → Advanced → Clear activity tab data"
echo "   2. Switch networks and switch back"
echo "   3. Disconnect and reconnect wallet"
