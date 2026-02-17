# Axios to Fetch Migration Plan

## Overview

Remove the `axios` dependency and replace all usages with the native `fetch` API.

---

## Tasks

- [x] **1. Migrate core `axiosInstance` in `src/lib/utils/utils.ts`**
  Replace `axios.create()`, request interceptors, and the exported `axiosInstance` with a custom `fetch` wrapper that preserves the base URL and header injection logic.

- [x] **2. Migrate `axiosInstance` in `src/app/providers/NFT/BoosterContext.tsx`**
  Replace `axios.create()` and its usage with `fetch`. This is an independent axios instance (no interceptors).

- [x] **3. Migrate `AxiosResponse` type usage in `src/shared/utils.ts`**
  Remove the `import type { AxiosResponse } from 'axios'` and replace the type with a native `Response`-compatible type or inline the shape.

- [x] **4. Migrate `axiosInstance` usage in `src/shared/hooks/useCommunity.ts`**
  Replace `axiosInstance` calls with the new `fetch` wrapper.

- [x] **5. Migrate `axiosInstance` usage in `src/app/user/Balances/hooks/useGetAddressTokens.ts`**
  Replace `axiosInstance.get<T>(...)` call with the new `fetch` wrapper.

- [x] **6. Migrate `axiosInstance` usage in `src/app/user/Balances/actions.ts`**
  Replace multiple `axiosInstance.get(...)` calls with the new `fetch` wrapper (7 call sites).

- [x] **7. Migrate `axiosInstance` usage in `src/app/providers/NFT/boost.utils.ts`**
  Replace `axiosInstance.get(...)` calls (imported from `BoosterContext`) with `fetch`.

- [x] **8. Migrate `axiosInstance` usage in `src/app/collective-rewards/actions.ts`**
  Replace multiple `axiosInstance.get(...)` calls with the new `fetch` wrapper (5 call sites).

- [x] **9. Migrate direct `axios.get()` in `.github/scripts/nft_boost/actions.utils.ts`**
  Replace `import axios` and `axios.get(url)` with native `fetch`.

- [x] **10. Remove `axios` dependency from `package.json` and `package-lock.json`**
  Uninstall the package after all usages are migrated.
