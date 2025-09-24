# ShadeSwap

A privacy-first DEX with anonymous trading personas built on Oasis Sapphire and Uniswap. This platform allows users to create and trade with anonymous personas, decoupling their real wallet address from trading activities.

## Features

- **Persona Creation**: Create multiple encrypted personas per wallet
- **Persona Switching**: Switch between personas in the UI
- **Token Swaps**: Execute swaps on Uniswap under the active persona
- **Trade History**: Display trade history per persona
- **Mid-Trade Switching**: Switch identities during a trade

## Tech Stack

- **Frontend**: React/Next.js + TailwindCSS
- **Smart Contracts**: Solidity on Oasis Sapphire
- **Development**: Hardhat
- **DEX Integration**: Uniswap Router

## App routes

- Landing page: `/` (marketing + CTA, subtle animations, rich footer)
- Dashboard app: `/app` (personas, swap, per-persona history)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy example env files and edit values (see below)
4. Start the development server: `npm run dev`

## Environment

Create `.env.local` (Next.js) and `.env` (Hardhat):

.env.local
```
NEXT_PUBLIC_SHAPESHIFTER_ADDR=0x...   # deployed on Sapphire; leave empty for simulation mode
NEXT_PUBLIC_DAI=0x...
NEXT_PUBLIC_USDC=0x...
NEXT_PUBLIC_WBTC=0x...
NEXT_PUBLIC_UNI=0x...
```

.env
```
PRIVATE_KEY=your_sapphire_private_key
SAPPHIRE_TESTNET_URL=https://testnet.sapphire.oasis.dev
# SAPPHIRE_MAINNET_URL=https://sapphire.oasis.io
```

Notes:
- If `NEXT_PUBLIC_SHAPESHIFTER_ADDR` is unset, the UI operates in simulation mode (router == 0x0) with simple 2% slippage math and no approvals.
- Set real token addresses for accurate approvals/routing when using a real router.

## Smart Contracts

- `contracts/IdentityShapeshifter.sol` integrates with a minimal Uniswap V3 router interface.
- Owner can set router/fee with `setSwapRouter(router, fee)`.
- If router is unset (`address(0)`), swaps run in simulation mode.

### Hardhat

- Compile: `npm run compile`
- Test: `npx hardhat test`
- Deploy: `npm run deploy` (expects `sapphire` network in `hardhat.config.js` and `.env` vars)

## Project Structure

```
/
├── contracts/         # Oasis Sapphire smart contracts
├── pages/             # Next.js pages
├── components/        # React components
├── public/            # Static assets
├── styles/            # CSS styles
├── scripts/           # Deployment scripts
└── test/              # Contract tests
```

## UI notes

- Minimal gray/white dark theme with reusable utility classes: `card`, `btn`, `input`, `chip`.
- Landing page includes SEO/Open Graph tags and subtle fade-up animations.
- Accessibility: labeled form fields, `aria-label`s, focus-visible outlines.
- Status messages surface as a small floating toast.

## To-do (polish)

- Replace placeholder logos and social links.
- Add more hover micro-interactions or staggered animations as needed.
- Broaden mobile testing and ARIA coverage.

## Notes on privacy

- Persona data and swap history are stored on Sapphire, encrypted at rest and shielded in execution.
- Public events emit minimal metadata (no amounts) to avoid leakage.
- Frontend queries history only for the caller’s identities.

## Uniswap integration

- Minimal interface `contracts/interfaces/ISwapRouter.sol` exposes `exactInputSingle` only.
- Contract approves router per-swap and forwards output tokens to the caller.
- Pool fee configurable (default 0.3%).

## Testing personas

- Tests cover creating multiple personas and executing swaps under each, with histories kept per-identity.
