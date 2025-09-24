# ShadeSwap Smart Contract

This document describes the `IdentityShapeshifter` smart contract - a privacy-first trading platform built on Oasis Sapphire and integrated with Uniswap.

## Overview

The `IdentityShapeshifter` contract enables users to create multiple encrypted personas per wallet address, decoupling their real wallet address from trading activities. Using Oasis Sapphire's confidential computation capabilities, the contract ensures that persona data and trading history remain private while still allowing the execution of swaps through Uniswap.

## Key Features

1. **Privacy-First Design**: Leverages Oasis Sapphire's confidential computation for privacy
2. **Persona Management**: Create and manage multiple trading personas per wallet
3. **Confidential Storage**: All persona metadata is encrypted using Sapphire's privacy features
4. **Private Trading**: Execute swaps via Uniswap without revealing your true identity
5. **Confidential History**: Trading history is stored privately and only accessible by the owner
6. **Mid-Trade Switching**: Support for switching personas during a trade flow

## Contract Structure

### Core Data Structures

- `Identity`: Represents a trading persona with name and encrypted metadata
- `SwapDetails`: Records details of a swap transaction under a specific persona

### Mappings

- `identities`: Maps user addresses to their persona data (encrypted)
- `userIdentityIds`: Tracks all persona IDs owned by a user
- `activeIdentities`: Stores the currently active persona for each user
- `swapHistory`: Records confidential trading history for each persona

## Key Functions

### Persona Management

- `createIdentity(string name, bytes metadata)`: Create a new persona with encrypted metadata
- `switchIdentity(bytes32 identityId)`: Set a different persona as the active one
- `getIdentityIds()`: Get all persona IDs owned by the caller
- `getIdentity(bytes32 identityId)`: Get details of a specific persona (decrypted)
- `getActiveIdentity()`: Get the currently active persona ID

### Trading Functions

- `swapTokens(address inputToken, address outputToken, uint256 amountIn, uint256 minAmountOut)`: Execute a swap via Uniswap under the active persona
- `midTradeSwitch(bytes32 identityId, bool continueSwap)`: Switch personas during a trade flow
- `getSwapHistory(bytes32 identityId)`: Get trading history for a specific persona

## Privacy Architecture

The contract uses Oasis Sapphire's confidential execution environment to ensure:

1. **Encrypted Storage**: All persona metadata is encrypted using Sapphire's encryption utilities
2. **Confidential Execution**: Trade operations occur within the confidential environment
3. **Private Data Access**: Only the wallet owner can decrypt and access their personas' data
4. **Minimal Events**: Public events emit only minimal necessary information

## Integration with Uniswap

The contract is designed to integrate with Uniswap's Router for token swaps:

1. User selects an active persona
2. User initiates a swap with input/output tokens and amounts
3. Contract executes the swap via Uniswap within the confidential environment
4. Swap is logged under the active persona, not the user's wallet address

## Usage Flow

1. Create one or more personas using `createIdentity()`
2. Switch between personas using `switchIdentity()`
3. Execute trades under the active persona with `swapTokens()`
4. View confidential trade history for any persona with `getSwapHistory()`
5. Optionally switch personas mid-trade using `midTradeSwitch()`

## Security Considerations

- Only the wallet owner can access their persona data and history
- All communication with the contract is encrypted using Sapphire's infrastructure
- Transaction data is protected within the confidential execution environment
- No trace of the relationship between personas and wallet addresses is publicly visible

## Deployment

The contract should be deployed to the Oasis Sapphire network to utilize its confidential computation features. Deployment requires the following:

1. Oasis Sapphire network configuration in Hardhat
2. The `@oasisprotocol/sapphire-contracts` dependency
3. Proper configuration of network settings and wallet keys

## Development Notes

This is an MVP implementation focusing on demonstrating the core privacy features. In a production environment, additional features would include:

- Full Uniswap Router integration
- Support for advanced swap parameters
- Multi-step transaction flows
- Extended persona customization options
