# Ledger Hardware Wallet Integration

This document describes the Ledger hardware wallet integration added to the Rootstock Collective DAO frontend.

## Overview

The Ledger integration allows users to connect their Ledger hardware wallets (Nano S, Nano X, Nano S Plus, and Stax) to interact with the Rootstock Collective DAO. This provides enhanced security for managing assets and participating in governance activities.

## Architecture

### Components

1. **LedgerConnector** (`src/config/ledgerConnector.ts`) - Custom Wagmi connector for Ledger devices
2. **useLedger Hook** (`src/shared/hooks/useLedger.ts`) - React hook for Ledger state management
3. **LedgerConnectButton** (`src/shared/walletConnection/components/LedgerConnectButton.tsx`) - UI component for Ledger connection

### Dependencies

- `@ledgerhq/hw-transport-webusb` - WebUSB transport for Ledger devices
- `@ledgerhq/hw-transport-webhid` - WebHID transport for Ledger devices (preferred)
- `@ledgerhq/hw-app-eth` - Ethereum app interface for Ledger devices
- `@ledgerhq/devices` - Ledger device definitions
- `@ledgerhq/errors` - Ledger error types and utilities

## Features

### Connection Methods

- **WebHID** (preferred) - Modern browser API for device communication
- **WebUSB** (fallback) - Alternative transport method

### Supported Operations

- Account connection and disconnection
- Message signing (EIP-191)
- Typed data signing (EIP-712)
- Transaction signing
- Chain switching

### User Experience

- Automatic transport detection
- Clear connection instructions
- Error handling with helpful messages
- Loading states and visual feedback

## Usage

### Basic Usage

```typescript
import { useLedger, LedgerConnectButton } from '@/shared/walletConnection'

function MyComponent() {
  const {
    isLedgerSupported,
    isLedgerConnected,
    isConnecting,
    error,
    connectLedger,
    disconnectLedger
  } = useLedger()

  return (
    <div>
      <LedgerConnectButton />
      {isLedgerConnected && <p>Ledger is connected!</p>}
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

### Custom Connection Button

```typescript
import { useLedger } from '@/shared/walletConnection'

function CustomLedgerButton() {
  const { connectLedger, isConnecting, isLedgerConnected } = useLedger()

  return (
    <button onClick={connectLedger} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : isLedgerConnected ? 'Disconnect' : 'Connect Ledger'}
    </button>
  )
}
```

## Browser Support

### Supported Browsers

- **Chrome** 89+ (WebHID support)
- **Edge** 89+ (WebHID support)
- **Opera** 75+ (WebHID support)
- **Brave** 1.24+ (WebHID support)

### Browser Permissions

The integration requires the following browser permissions:
- WebHID access for device communication
- WebUSB access (fallback)

Users will be prompted to grant these permissions when connecting.

## Setup Instructions for Users

### Prerequisites

1. **Ledger Device**: Nano S, Nano X, Nano S Plus, or Stax
2. **Ledger Live**: Latest version installed and device set up
3. **Ethereum App**: Installed on the Ledger device
4. **Browser**: Chrome, Edge, or compatible Chromium-based browser

### Connection Steps

1. **Prepare Device**:
   - Unlock your Ledger device
   - Open the Ethereum app on the device
   - Ensure "Blind signing" is enabled in Ethereum app settings (for complex transactions)

2. **Connect to Browser**:
   - Click "Connect Ledger" in the DAO interface
   - Follow browser prompts to select your device
   - Confirm connection on the Ledger device

3. **Verify Connection**:
   - Your address should appear in the wallet interface
   - The Ledger status should show as "Connected"

## Troubleshooting

### Common Issues

#### "Ledger Not Supported"
- **Cause**: Browser doesn't support WebHID/WebUSB
- **Solution**: Use Chrome, Edge, or another Chromium-based browser

#### "Please unlock your Ledger device and open the Ethereum app"
- **Cause**: Device is locked or Ethereum app not open
- **Solution**: 
  1. Unlock the device with your PIN
  2. Navigate to and open the Ethereum app
  3. Try connecting again

#### "Transport Error"
- **Cause**: USB connection issues or device not recognized
- **Solution**:
  1. Check USB cable connection
  2. Try a different USB port
  3. Restart the browser
  4. Update Ledger Live and device firmware

#### "User Rejected Request"
- **Cause**: User declined the connection or transaction on device
- **Solution**: Accept the request on the Ledger device screen

#### "Blind Signing Required"
- **Cause**: Complex transaction requires blind signing to be enabled
- **Solution**:
  1. Open Ledger Live
  2. Go to Manager → Ethereum app
  3. Enable "Blind signing" in settings
  4. Try the transaction again

### Advanced Troubleshooting

#### Device Not Detected
1. Ensure Ledger Live is closed (it can conflict with browser access)
2. Check that the device is in the Ethereum app, not the dashboard
3. Try disconnecting and reconnecting the USB cable
4. Clear browser cache and try again

#### Transaction Signing Issues
1. Verify the Ethereum app version is up to date
2. Check that contract data is enabled in Ethereum app settings
3. Ensure sufficient gas for the transaction
4. Try reducing transaction complexity if possible

## Security Considerations

### Best Practices

1. **Verify Transactions**: Always review transaction details on the Ledger screen
2. **Enable Blind Signing**: Only when necessary for complex transactions
3. **Keep Firmware Updated**: Regularly update device firmware through Ledger Live
4. **Secure Environment**: Use the device in a secure, private environment

### What's Protected

- **Private Keys**: Never leave the device, all signing happens on-device
- **Transaction Integrity**: All transaction details verified on device screen
- **Address Verification**: Address generation and verification on device

### Limitations

- Requires physical device interaction for all operations
- May have slower transaction signing compared to software wallets
- Limited to supported transaction types by the Ethereum app

## Development

### Adding New Features

To extend the Ledger integration:

1. **Update LedgerConnector**: Add new methods to the connector class
2. **Enhance useLedger Hook**: Add state and methods for new features
3. **Update UI Components**: Modify or create components for new functionality

### Testing

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Access the app with a connected Ledger device
# Test connection and basic operations
```

### Debugging

Enable debug logging:

```typescript
// In development, add logging to LedgerConnector
console.log('Ledger operation:', { method, params, result })
```

## API Reference

### useLedger Hook

```typescript
interface LedgerState {
  isLedgerSupported: boolean
  isLedgerConnected: boolean
  isConnecting: boolean
  error: string | null
  deviceInfo: {
    isWebHIDSupported: boolean
    isWebUSBSupported: boolean
  }
}

function useLedger(): LedgerState & {
  connectLedger: () => Promise<void>
  disconnectLedger: () => Promise<void>
  clearError: () => void
  getLedgerInstructions: () => Instructions
  isLoading: boolean
}
```

### LedgerConnector Class

```typescript
class LedgerConnector extends Connector {
  connect(): Promise<ConnectorData>
  disconnect(): Promise<void>
  getAccount(): Promise<Address>
  getChainId(): Promise<number>
  getProvider(): Promise<Provider>
  isAuthorized(): Promise<boolean>
  switchChain(chainId: number): Promise<Chain>
}
```

## Roadmap

### Planned Improvements

1. **Multi-account Support**: Allow users to select from multiple Ledger accounts
2. **Enhanced Error Messages**: More specific guidance for different error types
3. **Offline Signing**: Support for offline transaction preparation
4. **Advanced Transaction Types**: Support for more complex Rootstock operations

### Known Limitations

1. **Browser Dependency**: Limited to browsers with WebHID/WebUSB support
2. **Single Account**: Currently supports only the first account (m/44'/60'/0'/0/0)
3. **Transaction Complexity**: Some complex transactions may require blind signing

## Support

For issues related to Ledger integration:

1. **Check Documentation**: Review this guide and troubleshooting section
2. **Browser Support**: Ensure you're using a supported browser
3. **Device Firmware**: Keep Ledger device firmware updated
4. **Community Support**: Join our Discord for community assistance

For Ledger-specific issues:
- [Ledger Support](https://support.ledger.com/)
- [Ledger Developer Documentation](https://developers.ledger.com/) 