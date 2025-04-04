# IPFS Usage in the DAO App (Images, Metadata, and More)

This documentation describes the refactoring of IPFS usage across the app, mainly focused on NFT images, but equally applicable to metadata and any other IPFS-hosted content. While we mostly work with NFT images, the same approach applies to any asset identified by a CID, including metadata JSON files and other IPFS-hosted content.

NFT images are loaded via the dedicated IPFS-to-HTTP Piñata Gateway. The gateway URL is set through an environment variable:

```env
NEXT_PUBLIC_IPFS_GATEWAY=red-legislative-meadowlark-461.mypinata.cloud
```

The Piñata Gateway accepts requests from a set of whitelisted domains (including test and production domains, but **not localhost**). To load images during local development, you need to set the following environment variable:

```env
NEXT_PUBLIC_PINATA_GATEWAY_KEY=your_api_key_here
```

We **do not store this key in the repository**. Please contact Jesse or Alex S. to obtain this key.

---

## How Piñata Optimizes Images

Piñata Gateway optimizes NFT images on-the-fly via HTTP. By specifying IPFS CID and optimization parameters directly in the URL, we can avoid using our server for heavy image processing (around 2,000 images, several megabytes each).

### Available Image Optimization Options

```ts
/**
 * Interface for Pinata Image Optimization options.
 * Used to customize image serving through Pinata IPFS gateway.
 * For detailed parameters description visit:
 * @see https://docs.pinata.cloud/gateways/image-optimizations
 */
export interface PinataImageOptions {
  width?: number
  height?: number
  dpr?: number
  fit?: 'scaleDown' | 'contain' | 'cover' | 'crop' | 'pad'
  gravity?: 'auto' | 'side' | string
  quality?: number
  format?: 'auto' | 'webp'
  animation?: boolean
  sharpen?: number
  onError?: boolean
  metadata?: 'keep' | 'copyright' | 'none'
}
```

For further details, check the official [Piñata documentation](https://docs.pinata.cloud/gateways/image-optimizations).

---

## How to Load NFT Images

### Steps:

1. Retrieve the IPFS address (CID) of the NFT image from the smart contract.
2. Pass this CID into the `ipfsGatewayUrl` function to get the HTTP URL from the gateway.
3. Optionally, use `applyPinataImageOptions` to set image optimization parameters.

### Example Usage:

```ts
import { ipfsGatewayUrl, applyPinataImageOptions } from '@/lib/ipfs'

const imageCid = 'Qm...your-image-cid'
const gatewayUrl = ipfsGatewayUrl(imageCid)

const optimizedImageUrl = applyPinataImageOptions(gatewayUrl, {
  width: 300,
  format: 'webp',
  quality: 80,
})
```

You can now pass the resulting URL (`optimizedImageUrl`) into the `src` prop of an `<img>` or Next.js `<Image>` component, and the image will load accordingly.

---

## How to Load NFT Metadata

There are two ways to obtain NFT metadata (name, description, image):

- **Via Smart Contract (wagmi)**:  
  Use `fetchIpfsNftMeta(cid)` with the CID obtained from the smart contract function `tokenURI`. This is done using our hooks: `useCommunity` → `useContractData`.

- **Via Backend Endpoint**:  
  Request NFT metadata (including holder information) directly from our backend endpoint: `/nfts/{{address}}/holders` (handled via `useFetchNftHolders`).  
  The backend returns raw IPFS URLs, which you then convert into HTTP URLs using the method described above.

---

## Recent Changes (Summary)

### Centralized IPFS logic in `src/lib/ipfs.ts`

All IPFS-related functions are now located in one file (`src/lib/ipfs.ts`) to simplify understanding and maintenance.

### Main Functions:

- `ipfsGatewayUrl(cid: string): string`  
  Converts IPFS CID into an HTTP URL via Piñata gateway.

- `applyPinataImageOptions(url: string, options: PinataImageOptions): string`  
  Adds optimization parameters to the gateway URL.

- `fetchIpfsNftMeta(cid: string): Promise<NFTMeta>`  
  Retrieves NFT metadata JSON directly from IPFS via gateway.

### Deprecated/Removed Logic:

- Removed image loading via fetch and blob conversion, as this is no longer required.
- Backend no longer deals with gateway logic; it now simply returns IPFS URLs.
- All image processing logic moved entirely to the frontend for simplicity, as Piñata handles optimization on-the-fly.

---

This approach ensures efficient, scalable, and simplified handling of NFT images and metadata within our application.
