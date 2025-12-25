#!/bin/bash

# Script to fund a wallet with USDT0 tokens and RBTC on Anvil fork
# Usage: ./scripts/fund-usdt0.sh <YOUR_WALLET_ADDRESS> [USDT0_AMOUNT] [RBTC_AMOUNT]
# Example: ./scripts/fund-usdt0.sh 0x1234...abcd 1000 10

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

# Step 1: Fund wallet with RBTC
echo "1️⃣ Adding $RBTC_AMOUNT RBTC to wallet..."
RBTC_WEI=$(cast --to-wei $RBTC_AMOUNT)
cast rpc anvil_setBalance "$WALLET_ADDRESS" "$RBTC_WEI" --rpc-url "$RPC_URL" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "   ✅ Successfully added $RBTC_AMOUNT RBTC!"
else
  echo "   ❌ Failed to add RBTC"
fi
echo ""

# Step 2: Fund wallet with USDT0
echo "2️⃣ Adding $AMOUNT USDT0 to wallet..."
echo ""

# Method 1: Try to impersonate a real account with USDT0 and transfer
# The Uniswap pool typically has tokens
POOL_ADDRESS="0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0"

echo "   Checking if pool has USDT0 tokens..."
POOL_BALANCE=$(cast call "$USDT0_ADDRESS" \
  "balanceOf(address)(uint256)" \
  "$POOL_ADDRESS" \
  --rpc-url "$RPC_URL" 2>/dev/null || echo "0")

if [ "$POOL_BALANCE" != "0" ] && [ -n "$POOL_BALANCE" ]; then
  POOL_BALANCE_DECIMAL=$(echo "$POOL_BALANCE" | xargs printf "%d" 2>/dev/null || echo "0")
  if [ "$POOL_BALANCE_DECIMAL" -ge "$AMOUNT_WEI" ] 2>/dev/null; then
    echo "   ✅ Pool has sufficient USDT0. Using transfer method..."
    echo "   Funding pool address with rBTC for gas..."
    cast rpc anvil_setBalance "$POOL_ADDRESS" $(cast --to-wei 10) --rpc-url "$RPC_URL" > /dev/null 2>&1
    
    echo "   Impersonating pool address: $POOL_ADDRESS"
    cast rpc anvil_impersonateAccount "$POOL_ADDRESS" --rpc-url "$RPC_URL" > /dev/null 2>&1
    
    echo "   Transferring $AMOUNT USDT0..."
    # Use direct RPC call since cast send has issues with impersonated accounts
    TRANSFER_DATA=$(cast calldata "transfer(address,uint256)" "$WALLET_ADDRESS" "$AMOUNT_WEI")
    TRANSFER_RESULT=$(curl -s -X POST "$RPC_URL" \
      -H "Content-Type: application/json" \
      -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_sendTransaction\",\"params\":[{\"from\":\"$POOL_ADDRESS\",\"to\":\"$USDT0_ADDRESS\",\"data\":\"$TRANSFER_DATA\"}],\"id\":1}")
    
    TRANSFER_ERROR=$(echo "$TRANSFER_RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('error', {}).get('message', ''))" 2>/dev/null || echo "")
    
    if [ -z "$TRANSFER_ERROR" ] || [ "$TRANSFER_ERROR" = "None" ]; then
      TRANSFER_OUTPUT=""
      TRANSFER_EXIT_CODE=0
    else
      TRANSFER_OUTPUT="Error: $TRANSFER_ERROR"
      TRANSFER_EXIT_CODE=1
    fi
    
    if [ $? -eq 0 ]; then
      echo "✅ Successfully transferred USDT0!"
      METHOD="transfer"
    else
      echo "⚠️  Transfer failed: $TRANSFER_OUTPUT"
      METHOD="storage"
    fi
  else
    echo "   ⚠️  Pool doesn't have enough tokens. Using storage method..."
    METHOD="storage"
  fi
else
  echo "   ⚠️  Pool has no tokens. Using storage method..."
  METHOD="storage"
fi

# Method 2: Use Anvil's setStorage to directly set the ERC20 balance
if [ "$METHOD" != "transfer" ]; then
  echo ""
  echo "   Using storage manipulation to set balance..."
  
  # USDT0 is an upgradeable ERC20 (OpenZeppelin ERC20Upgradeable)
  # The balances mapping is at storage slot 51
  BALANCE_SLOT=51
  
  # Calculate storage key: keccak256(abi.encode(address, slot))
  ENCODED=$(cast abi-encode "x(address,uint256)" "$WALLET_ADDRESS" $BALANCE_SLOT 2>/dev/null)
  STORAGE_KEY=$(cast keccak "$ENCODED" 2>/dev/null)
  
  echo "   Balance slot: $BALANCE_SLOT"
  echo "   Storage key: $STORAGE_KEY"
  echo "   Amount: $AMOUNT_WEI wei ($AMOUNT USDT0)"
  
  # Set the storage value
  SET_STORAGE_RESULT=$(cast rpc anvil_setStorageAt \
    "$USDT0_ADDRESS" \
    "$STORAGE_KEY" \
    "$AMOUNT_HEX" \
    --rpc-url "$RPC_URL" 2>&1)
  
  if [ $? -ne 0 ]; then
    echo "❌ Failed to set storage: $SET_STORAGE_RESULT"
    exit 1
  fi
fi

if [ $? -eq 0 ]; then
  echo "✅ Successfully set USDT0 balance!"
  echo ""
  
  # Verify the balance
  echo "3️⃣ Verifying balances..."
  BALANCE_HEX=$(cast call "$USDT0_ADDRESS" \
    "balanceOf(address)(uint256)" \
    "$WALLET_ADDRESS" \
    --rpc-url "$RPC_URL" 2>/dev/null | head -1)
  
  if [ -n "$BALANCE_HEX" ] && [ "$BALANCE_HEX" != "0" ] && [ "$BALANCE_HEX" != "0x0" ]; then
    # Convert hex to decimal using cast
    BALANCE_DECIMAL=$(cast --to-dec "$BALANCE_HEX" 2>/dev/null || echo "0")
    if [ "$BALANCE_DECIMAL" != "0" ] && [ -n "$BALANCE_DECIMAL" ]; then
      BALANCE_USDT0=$(echo "scale=2; $BALANCE_DECIMAL / 1000000" | bc 2>/dev/null || echo "$(($BALANCE_DECIMAL / 1000000))")
      echo "✅ Verified! Your wallet now has $BALANCE_USDT0 USDT0"
    else
      echo "✅ Transfer completed! Check balance in MetaMask"
    fi
  else
    echo "⚠️  Transfer completed, but verification returned: $BALANCE_HEX"
    echo "   Please check the balance in MetaMask"
  fi
else
  echo "❌ Failed to set storage"
  echo "Error: $SET_STORAGE_RESULT"
  echo ""
  echo "Trying alternative: impersonate a real account with USDT0..."
  
  # Alternative: Try to find and impersonate a real account with USDT0
  # Try the Uniswap pool address
  POOL_ADDRESS="0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0"
  
  echo "   Impersonating pool address: $POOL_ADDRESS"
  cast rpc anvil_impersonateAccount "$POOL_ADDRESS" --rpc-url "$RPC_URL" > /dev/null 2>&1
  
  echo "   Attempting transfer..."
  TRANSFER_OUTPUT=$(cast send "$USDT0_ADDRESS" \
    "transfer(address,uint256)" \
    "$WALLET_ADDRESS" \
    "$AMOUNT_WEI" \
    --rpc-url "$RPC_URL" \
    --from "$POOL_ADDRESS" \
    --unlocked 2>&1)
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully transferred USDT0 via impersonation!"
  else
    echo "❌ Both methods failed"
    echo "Transfer error: $TRANSFER_OUTPUT"
    echo ""
    echo "Please check:"
    echo "   - Anvil fork is running (npm run fork:anvil)"
    echo "   - Wallet address is correct: $WALLET_ADDRESS"
    echo "   - USDT0 contract exists on fork: $USDT0_ADDRESS"
    exit 1
  fi
fi

# Verify RBTC balance
RBTC_BALANCE=$(cast balance "$WALLET_ADDRESS" --rpc-url "$RPC_URL" 2>/dev/null)
if [ -n "$RBTC_BALANCE" ]; then
  RBTC_BALANCE_ETH=$(cast --from-wei "$RBTC_BALANCE" 2>/dev/null || echo "$RBTC_BALANCE")
  echo "   RBTC balance: $RBTC_BALANCE_ETH RBTC"
fi

echo ""
echo "💡 Check your balances in MetaMask or run:"
echo "   cast balance $WALLET_ADDRESS --rpc-url $RPC_URL"
echo "   cast call $USDT0_ADDRESS \"balanceOf(address)(uint256)\" $WALLET_ADDRESS --rpc-url $RPC_URL"

