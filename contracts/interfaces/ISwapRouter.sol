// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/// @title Minimal Uniswap V3 Swap Router interface (exactInputSingle only)
/// @notice This is a lightweight interface with only the pieces we use to avoid pulling GPL code.
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps a fixed amount of one token for a maximum possible amount of another token
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}
