# ShadeSwap MVP Rules and Guidelines

## Project Overview

**ShadeSwap** is a privacy-first trading platform built on Oasis Sapphire and Uniswap. It allows users to create and trade with anonymous personas, decoupling their real wallet address from trading activities. This MVP is scoped for a 3-4 hour hackathon build, focusing on core features to demonstrate the concept.

## MVP Features

1. **Persona Creation**: Users can create multiple encrypted personas per wallet.
2. **Persona Switching**: Users can switch between personas in the UI.
3. **Token Swaps**: Execute swaps on Uniswap under the active persona.
4. **Trade History**: Display trade history per persona.
5. **Mid-Trade Switching Demo**: Showcase switching identities during a trade.

## Architecture

- **Frontend**: React/Next.js for persona dashboard and swap UI.
- **Backend**: Oasis Sapphire smart contract for confidential storage of identities and persona management.
- **Integration**: Uniswap Router for token swaps, linked to persona IDs rather than wallet addresses.

## Development Guidelines

### Smart Contract (Oasis Sapphire)

- **Functions**:
  - `createIdentity(name, metadata)`: Create a new persona with encrypted storage.
  - `switchIdentity(identityId)`: Set the active persona for trading.
  - `swapTokens(inputToken, outputToken, amount)`: Execute a swap via Uniswap Router, logging under the active persona.
  - `logTrade(identityId, swapDetails)`: Record trade details under the specified persona.
- **Privacy**: Ensure personas are stored confidentially using Oasis Sapphire's capabilities.

### Frontend (React/Next.js)

- **Components**:
  - **Persona List**: Display all personas with a form to create new ones.
  - **Active Persona Indicator**: Show which persona is currently active.
  - **Swap Form**: Interface to select tokens and amount for swaps.
  - **Trade History**: Show trades per persona.
- **UI Design**: Keep it simple yet engaging with fun persona icons/names for demo appeal. Avoid an overly AI-generated look, aiming for a human, organic design style [[memory:3691285]].

### Integration

- Connect frontend to the Oasis Sapphire contract for persona management.
- Ensure swaps are executed through Uniswap but logged under personas.
- Implement mid-trade switching logic to fragment swap logs across personas.

## Development Steps

1. **Setup Project Structure**: Initialize a new project with necessary dependencies for React/Next.js and Hardhat for contract compilation.
2. **Smart Contract Development**: Write and deploy the Oasis Sapphire contract with the specified functions.
3. **Frontend Development**: Build the UI components for persona management and trading.
4. **Integration**: Link frontend to contract, test flows for persona creation, switching, and swaps.
5. **Demo Preparation**: Add polish (icons, names) and prepare a 5-minute demo script showcasing persona creation, trading, and mid-trade switching.

## Tools and Technologies

- **Hardhat**: Use for smart contract compilation and deployment, adhering to user preference for Hardhat only [[memory:2416486]].
- **Oasis Sapphire**: For confidential storage and execution.
- **Uniswap**: For token swaps.
- **React/Next.js**: For frontend development.

## Demo Script Outline

1. Create two personas: 'Degen Ape 🐒' and 'Whale 🐳'.
2. Show dashboard with active persona as 'Degen Ape'.
3. Perform a Uniswap swap, logged under 'Degen Ape'.
4. Midway, switch to 'Whale 🐳' and complete the swap.
5. Display trade history showing one wallet with two personas, no clear link.

## Notes

- Focus on minimal but powerful features for the hackathon scope.
- Ensure the MVP is memorable, funny, and technically legit for judges.
- Keep future extensions (Persona NFTs, ZK proofs) in mind but out of MVP scope.

This `currorrules.md` file serves as the blueprint for building the ShadeSwap MVP, ensuring all team members align on the vision and deliverables.
