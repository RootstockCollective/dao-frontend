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

| File                          | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `siweStore.ts`                | Zustand store for JWT token, auth state, and `signOut`        |
| `actions.ts`                  | Server-side auth logic: `requestChallenge`, `verifySignature` |
| `challengeStore.ts`           | Server-side challenge storage and validation                  |
| `domain.ts`                   | Trusted domain allowlist for EIP-4361 domain binding          |
| `jwt.ts`                      | Client-side JWT utilities (decode, check expiry)              |
| `jwt.server.ts`               | Server-side JWT signing and verification                      |
| `session.ts`                  | Session management utilities                                  |
| `withAuth.ts`                 | API route middleware for JWT validation                       |
| `useSignIn.ts` (shared hook)  | React hook wrapping the full sign-in flow                     |
| `api/auth/challenge/route.ts` | POST endpoint for SIWE challenge creation                     |
| `api/auth/login/route.ts`     | POST endpoint for signature verification and JWT issuance     |
| `api/auth/verify/route.ts`    | POST endpoint for JWT validation                              |
| `proxy.ts` (src root)         | Rate limiting middleware for all auth API routes              |
| `rateLimit.ts` (src/lib)      | In-memory sliding window rate limiter                         |

## Security Considerations

- **Challenge is server-generated**: The SIWE message is created entirely on the server, preventing client-side manipulation of the nonce, domain, or expiration.
- **Domain binding** ([EIP-4361 Relying Party steps](https://eips.ethereum.org/EIPS/eip-4361#relying-party-implementer-steps)): a challenge is only issued for an origin this deployment actually serves, and the same expected domain is passed to `siweMessage.verify()` at redemption. The `Host` header is caller-supplied, so it is not trusted as the expected origin on its own.
  - The allowlist is the explicit list of deployed hostnames in `domain.ts` (`DEPLOYED_HOSTNAMES`), plus `localhost` / loopback outside production. It is **not** a suffix match on `rootstockcollective.xyz`: sibling subdomains host third-party platforms serving user-authored content (`gov.` is Discourse, `wiki.` is a hosted wiki), and a suffix match would extend sign-in trust to all of them.
  - **Adding an environment requires updating `DEPLOYED_HOSTNAMES`**, or setting `SIWE_ALLOWED_DOMAINS`. Requests from an origin outside the allowlist fail at `/api/auth/challenge` with `Invalid request`.
  - `SIWE_ALLOWED_DOMAINS` (server-only, comma-separated hostnames) replaces the built-in list entirely when set — subdomains of a listed domain are **not** implied.
  - The enforcement that matters happens **at issuance**. The `domain` passed to `siweMessage.verify()` cannot fail today, since the message comes from our own store and carries the domain we wrote; it is kept for standards compliance and to stay correct if the message ever arrives from somewhere less trusted.

### Running SIWE on a production build

`isProduction` comes from `NODE_ENV`, which Next inlines at build time. In a production build served over loopback (`npm run build:start`, `next start`, or the Docker image on `localhost:3000`) the loopback rule does **not** apply, and `/api/auth/challenge` returns `Invalid request`. QA validating against a production build needs:

```
SIWE_ALLOWED_DOMAINS=localhost
```

Note that the `uri` scheme is derived from `NODE_ENV` rather than the request, so in that setup the message reads `https://localhost:3000` while the page is served over `http`. Deriving the scheme from `x-forwarded-proto` would fix this properly — pre-existing, tracked as a follow-up.

### Known deviation

The SIWE `domain` field carries the hostname without the port, while EIP-4361 defines it as the RFC 4501 dns authority (port included when non-default). This only differs from the page origin during local development on a non-default port. Pre-existing behaviour, kept unchanged here to avoid altering what wallets display in production.
- **JWT on disconnect**: When the user disconnects their wallet, the JWT is destroyed and all authenticated UI state (e.g. like icons) is reset. On reconnect, the user must re-authenticate via SIWE to restore their session.
- **Token expiry**: Expired JWTs are cleared automatically on store rehydration.
- **Rate limiting**: All auth endpoints are rate-limited via middleware (5 req/min for challenge and login, 20 req/min for verify) to prevent brute-force and DoS attacks.
