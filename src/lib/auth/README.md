# SIWE Authentication

## What is SIWE?

SIWE (Sign-In With Ethereum) is a standard ([EIP-4361](https://eips.ethereum.org/EIPS/eip-4361)) that allows users to authenticate with a dApp by signing a message with their wallet. It provides cryptographic proof of address ownership without requiring passwords or third-party identity providers.

## Why SIWE?

Connecting a wallet (e.g. via Reown/WalletConnect) only establishes a connection — it does **not** prove ownership of the address. Anyone can initiate a connection to a dApp. SIWE solves this by requiring the user to sign a structured message with their private key, which the server can verify.

This distinction matters for features tied to user identity, such as proposal likes. Without SIWE, we cannot securely associate actions with an address.

## Authentication Flow

```
1. User connects wallet (Reown/WalletConnect)
   → Establishes connection, no identity proof yet

2. User triggers an authenticated action (e.g. like a proposal)
   → Client requests a challenge from the server

3. Server generates a SIWE message with a unique challengeId
   → Message includes domain, address, nonce, expiration

4. User signs the message in their wallet
   → Cryptographic proof of address ownership

5. Client sends signature + challengeId to the server
   → Server verifies the signature against the challenge

6. Server issues a JWT containing the user's address
   → Stored client-side in Zustand (persisted to localStorage)

7. JWT is sent as a Bearer token on authenticated API requests
   → Server validates the JWT on each request
```

## Features Using SIWE

### Proposal Likes

Users can like (heart) proposals on the proposal detail page. SIWE authentication is required because:

- **Liking** sends a POST to `/api/like` with the JWT as a Bearer token — the server uses the address in the JWT to record who liked what.
- **Viewing your own likes** queries `/api/like/user` with the JWT to check if the current user has already reacted to a proposal. Without a valid JWT, the heart icon defaults to the unselected (grey) state.
- **On disconnect**, the JWT is cleared and all heart icons reset to grey. On reconnect, the user must re-authenticate via SIWE before their like state is restored from the server.

Key components: `LikeButton.tsx`, `useLike.ts`, `SiweTooltipContent.tsx`

## Key Files

| File | Purpose |
|---|---|
| `siweStore.ts` | Zustand store for JWT token, auth state, and `signOut` |
| `actions.ts` | Server actions: `requestChallenge`, `verifySignature` |
| `challengeStore.ts` | Server-side challenge storage and validation |
| `jwt.ts` | Client-side JWT utilities (decode, check expiry) |
| `jwt.server.ts` | Server-side JWT signing and verification |
| `session.ts` | Session management utilities |
| `withAuth.ts` | API route middleware for JWT validation |
| `useSignIn.ts` (shared hook) | React hook wrapping the full sign-in flow |

## Security Considerations

- **Challenge is server-generated**: The SIWE message is created entirely on the server, preventing client-side manipulation of the nonce, domain, or expiration.
- **JWT on disconnect**: When the user disconnects their wallet, the JWT is destroyed and all authenticated UI state (e.g. like icons) is reset. On reconnect, the user must re-authenticate via SIWE to restore their session.
- **Token expiry**: Expired JWTs are cleared automatically on store rehydration.
