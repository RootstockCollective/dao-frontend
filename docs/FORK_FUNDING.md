# Funding Your Wallet in Anvil Fork

This guide explains how to fund your wallet with test tokens in the Anvil fork for testing swap functionality and other dApp features.

## ⚠️ Fork Environment Limitations

**Important**: The fork environment is a **mainnet fork**, which means:

- ✅ **Works**: Mainnet-only contracts (Uniswap Quoter/Router for swaps)
- ❌ **Doesn't Work**: Testnet-only contracts (Vault, some DAO contracts)
  - These contracts don't exist on mainnet, so they won't exist on the fork
  - To test Vault functionality, use the `testnet` environment instead

**Why this approach?**

- Swapping contracts (Uniswap) only exist on mainnet, so we need a mainnet fork to test them
- Other contracts (Vault) only exist on testnet, so they won't work on a mainnet fork
- This is a common limitation when testing mainnet-only contracts in DeFi

**Solution**: Use `testnet` environment for Vault testing, `fork` environment for swap testing.

## ⚠️ Important: Add Fork Network to MetaMask First

**Yes, you need to add the fork network to MetaMask** to connect your wallet to the local Anvil fork.

### Steps to Add Fork Network to MetaMask:

1. **First, make sure Anvil is running**:

   ```bash
   npm run fork:anvil
   ```

   Keep this terminal running! Anvil must be active for MetaMask to connect.

2. **Open MetaMask** and click the network dropdown (usually shows "Ethereum Mainnet" or similar)
3. **Click "Add Network"** or "Add a network manually"
4. **Enter the following details** (⚠️ **IMPORTANT**: Include `http://` in the RPC URL):
   - **Network Name**: `Rootstock Fork` (or any name you prefer)
   - **RPC URL**: `http://127.0.0.1:8545` ⚠️ **Must include `http://` prefix!**
   - **Chain ID**: `31337` (Anvil's default chain ID - avoids MetaMask conflicts)
   - **Currency Symbol**: `rBTC`
   - **Block Explorer URL**: `https://rootstock.blockscout.com` (optional, for reference)

5. **Click "Save"**

   > ✅ **Note**: We use Chain ID `31337` (Anvil's default) instead of `30` to avoid MetaMask conflicts. The fork still contains all Rootstock Mainnet contracts and state, just with a different chain ID for local testing.

### Troubleshooting MetaMask Connection Errors:

**Error: "Could not fetch chain ID. Is your RPC URL correct?"**

- ✅ Make sure Anvil is running (`npm run fork:anvil`)
- ✅ Ensure the RPC URL includes `http://` prefix: `http://127.0.0.1:8545` (not just `127.0.0.1:8545`)
- ✅ Check that no firewall is blocking port 8545
- ✅ Try clicking "Save" again after Anvil is running

**Warning: "This Chain ID is currently used by the Rootstock Mainnet network"**

- ✅ This is expected and safe to ignore - click "Approve" or "Save anyway"
- The fork uses Chain ID 31337 (Anvil's default) but connects to your local Anvil

Now your MetaMask is connected to the local fork! You can switch to this network and use your wallet address.

## Quick Setup Checklist:

```bash
# 1. Start the fork
npm run fork:anvil

# 2. Add network to MetaMask (see above)

# 3. Get your wallet address from MetaMask (copy it)

# 4. Fund your wallet with USDT0 using the helper script
./scripts/fund-usdt0.sh YOUR_WALLET_ADDRESS

# Or fund with custom amount (e.g., 50,000 USDT0)
./scripts/fund-usdt0.sh YOUR_WALLET_ADDRESS 50000
```

> **Note**: The funding script must be called directly. Replace `YOUR_WALLET_ADDRESS` with your actual MetaMask wallet address.

## Method 1: Use Anvil's Pre-funded Accounts (Quick Start)

When you start Anvil, it automatically creates 10 pre-funded accounts with rBTC. You can import these directly into MetaMask:

1. **Start Anvil**:

   ```bash
   npm run fork:anvil
   ```

2. **Check the console output** - Anvil will display something like:

   ```
   Available Accounts
   ==================
   (0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
   (1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
   ...

   Private Keys
   ==================
   (0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   (1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ...
   ```

3. **Import a private key into MetaMask**:
   - Open MetaMask
   - Click account icon → Import Account
   - Paste one of the private keys
   - You now have 10,000 rBTC in that account!

   > ⚠️ **Note**: These accounts have rBTC but not ERC-20 tokens. To test swaps, you'll need to fund them with USDT0/USDRIF using Method 2 below.

## Method 2: Fund Your Wallet with Tokens (Recommended for Swap Testing)

This method allows you to fund any wallet address (including your own MetaMask wallet or Anvil's pre-funded accounts) with ERC-20 tokens like USDT0 and USDRIF.

### Option A: Fund with USDT0 Using Helper Script (Easiest)

The easiest way to fund your wallet with USDT0 is using the provided script:

```bash
# Fund with default 10,000 USDT0
./scripts/fund-usdt0.sh YOUR_WALLET_ADDRESS

# Fund with custom amount (e.g., 50,000 USDT0)
./scripts/fund-usdt0.sh YOUR_WALLET_ADDRESS 50000
```

**What the script does:**

1. Checks if the Uniswap pool has USDT0 tokens
2. Funds the pool address with rBTC for gas
3. Impersonates the pool address
4. Transfers USDT0 to your wallet
5. Verifies the balance

### Manual Funding with Cast Commands

If you prefer to fund manually or need other tokens:

#### Fund with rBTC (Native Currency)

```bash
# Set balance to 100 rBTC (100 * 10^18 wei)
cast rpc anvil_setBalance \
  YOUR_WALLET_ADDRESS \
  $(cast --to-wei 100) \
  --rpc-url http://127.0.0.1:8545
```

#### Fund with USDT0 (ERC-20 Token, 6 decimals)

```bash
# Step 1: Fund the pool address with rBTC for gas
cast rpc anvil_setBalance \
  0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  $(cast --to-wei 10) \
  --rpc-url http://127.0.0.1:8545

# Step 2: Impersonate the pool address
cast rpc anvil_impersonateAccount \
  0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  --rpc-url http://127.0.0.1:8545

# Step 3: Transfer USDT0 to your wallet (example: 10,000 USDT0)
# USDT0 has 6 decimals, so 10,000 * 10^6 = 10000000000
cast send \
  0x779Ded0c9e1022225f8E0630b35a9b54bE713736 \
  "transfer(address,uint256)" \
  YOUR_WALLET_ADDRESS \
  10000000000 \
  --rpc-url http://127.0.0.1:8545 \
  --from 0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  --unlocked
```

#### Fund with USDRIF (ERC-20 Token, 18 decimals)

```bash
# Step 1: Fund the pool address with rBTC for gas (if not already done)
cast rpc anvil_setBalance \
  0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  $(cast --to-wei 10) \
  --rpc-url http://127.0.0.1:8545

# Step 2: Impersonate the pool address
cast rpc anvil_impersonateAccount \
  0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  --rpc-url http://127.0.0.1:8545

# Step 3: Transfer USDRIF to your wallet (example: 10,000 USDRIF)
# USDRIF has 18 decimals, so 10,000 * 10^18
cast send \
  0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37 \
  "transfer(address,uint256)" \
  YOUR_WALLET_ADDRESS \
  $(cast --to-wei 10000) \
  --rpc-url http://127.0.0.1:8545 \
  --from 0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  --unlocked
```

#### Fund with RIF or stRIF

```bash
# Find an account with RIF/stRIF on mainnet and impersonate it
# Then transfer to your wallet using the same pattern as above

# RIF address: 0x2acc95758f8b5f583470ba265eb685a8f45fc9d5 (18 decimals)
# stRIF address: 0x5db91e24bd32059584bbdb831a901f1199f3d459 (18 decimals)
```

## Method 3: Fund Multiple Tokens at Once

For a complete funding solution that funds multiple tokens (rBTC, USDT0, USDRIF) at once, you can combine the commands from Method 2 or create a custom script. See the "Complete Example" section below for a full workflow.

## Quick Reference

### Token Addresses (Rootstock Mainnet - Available on Fork)

All addresses are from Rootstock Mainnet and available on the fork:

- **RIF**: `0x2acc95758f8b5f583470ba265eb685a8f45fc9d5` (18 decimals)
- **stRIF**: `0x5db91e24bd32059584bbdb831a901f1199f3d459` (18 decimals)
- **USDRIF**: `0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37` (18 decimals)
- **USDT0**: `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` (6 decimals)
- **rBTC**: Native currency (18 decimals)

### DEX Contract Addresses

- **Uniswap Quoter V2**: `0xb51727c996C68E60F598A923a5006853cd2fEB31`
- **Uniswap Universal Router**: `0x244f68e77357f86a8522323eBF80b5FC2F814d3E`
- **IceCreamSwap Router**: `0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c`
- **USDT0/USDRIF Pool**: `0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0`

### Common Cast Commands

```bash
# Set rBTC balance
cast rpc anvil_setBalance <address> $(cast --to-wei <amount>) --rpc-url http://127.0.0.1:8545

# Impersonate account
cast rpc anvil_impersonateAccount <address> --rpc-url http://127.0.0.1:8545

# Check rBTC balance
cast balance <address> --rpc-url http://127.0.0.1:8545

# Check ERC-20 token balance
cast call <token_address> "balanceOf(address)(uint256)" <address> --rpc-url http://127.0.0.1:8545

# Transfer ERC-20 token
cast send <token_address> "transfer(address,uint256)" <to_address> <amount_in_wei> \
  --rpc-url http://127.0.0.1:8545 \
  --from <impersonated_address> \
  --unlocked
```

### Helper Script Usage

```bash
# Fund with USDT0 (default 10,000)
./scripts/fund-usdt0.sh YOUR_WALLET_ADDRESS

# Fund with custom amount
./scripts/fund-usdt0.sh YOUR_WALLET_ADDRESS 50000

# Check your balance after funding
cast call 0x779Ded0c9e1022225f8E0630b35a9b54bE713736 \
  "balanceOf(address)(uint256)" \
  YOUR_WALLET_ADDRESS \
  --rpc-url http://127.0.0.1:8545
```

## Complete Example: Full Setup for Swap Testing

```bash
# Terminal 1: Start the fork
npm run fork:anvil

# Terminal 2: Fund your wallet
# Replace 0xYourWalletAddress with your actual MetaMask address

# 1. Fund with rBTC (for gas fees)
cast rpc anvil_setBalance \
  0xYourWalletAddress \
  $(cast --to-wei 100) \
  --rpc-url http://127.0.0.1:8545

# 2. Fund with USDT0 using the helper script (easiest)
./scripts/fund-usdt0.sh 0xYourWalletAddress 10000

# 3. (Optional) Fund with USDRIF manually
cast rpc anvil_setBalance \
  0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  $(cast --to-wei 10) \
  --rpc-url http://127.0.0.1:8545

cast rpc anvil_impersonateAccount \
  0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  --rpc-url http://127.0.0.1:8545

cast send \
  0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37 \
  "transfer(address,uint256)" \
  0xYourWalletAddress \
  $(cast --to-wei 10000) \
  --rpc-url http://127.0.0.1:8545 \
  --from 0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 \
  --unlocked

# 4. Verify balances in MetaMask or using cast:
cast call 0x779Ded0c9e1022225f8E0630b35a9b54bE713736 \
  "balanceOf(address)(uint256)" \
  0xYourWalletAddress \
  --rpc-url http://127.0.0.1:8545

# 5. Connect MetaMask to the fork network (see "Add Fork Network to MetaMask" above)
# 6. You're ready to test swaps!
```

## Tips

1. **Use the helper script** - `./scripts/fund-usdt0.sh` is the easiest way to fund with USDT0
2. **Pre-funded accounts** - Anvil's pre-funded accounts have rBTC but need ERC-20 tokens funded separately
3. **Unlimited funding** - Anvil allows unlimited test funds, so don't worry about running out
4. **Reset fork** - Restart Anvil to reset all balances and state
5. **Check balances** - Use `cast call` to verify token balances before testing

## Troubleshooting

**Script fails with "Failed to fund wallet"**

- ✅ Make sure Anvil is running (`npm run fork:anvil`)
- ✅ Verify the wallet address is correct (should start with `0x`)
- ✅ Check that the pool has tokens: `cast call 0x779Ded0c9e1022225f8E0630b35a9b54bE713736 "balanceOf(address)(uint256)" 0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0 --rpc-url http://127.0.0.1:8545`

**Token balance not showing in MetaMask**

- ✅ Make sure you're connected to the "Rootstock Fork" network (Chain ID 31337)
- ✅ Try importing the token manually in MetaMask using the token address
- ✅ Refresh the page or reconnect your wallet

**"Method not found" errors**

- ✅ Make sure you're using the correct RPC URL: `http://127.0.0.1:8545`
- ✅ Verify Anvil is running and responding: `curl -X POST http://127.0.0.1:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'`
