// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import "./interfaces/ISwapRouter.sol";

/**
 * @title IdentityShapeshifter
 * @dev Smart contract for managing private personas on Oasis Sapphire
 * Utilizes Sapphire's confidential computation features for privacy
 */
contract IdentityShapeshifter is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    // Use Sapphire's encryption utilities
    // using Sapphire for bytes;
    // using Sapphire for bytes32;
    // using Sapphire for string;

    // Struct to represent a persona/identity
    struct Identity {
        string name;         // Plain text name
        bytes encryptedData; // Metadata about this persona (confidential at rest on Sapphire)
        bool exists;
    }

    // Struct to represent a swap transaction
    struct SwapDetails {
        address inputToken;
        address outputToken;
        uint256 amountIn;
        uint256 amountOut;
        uint256 timestamp;
    }

    // Uniswap V3 router configuration
    address public swapRouter; // zero means "simulation mode" for local dev/tests
    uint24 public poolFee = 3000; // default 0.3%
    
    // Counter for identity IDs (using OpenZeppelin's Counters)
    Counters.Counter private _identityCounter;

    // Mapping from user address => identity ID => Identity
    // All identity data is kept confidential on the Sapphire ParaTime
    mapping(address => mapping(bytes32 => Identity)) private identities;
    
    // Mapping from user address => identity IDs
    mapping(address => bytes32[]) private userIdentityIds;
    
    // Mapping from user address => active identity ID
    mapping(address => bytes32) private activeIdentities;
    
    // Mapping from identity ID => swap history
    // This history is confidential and can only be accessed by the identity owner
    mapping(bytes32 => SwapDetails[]) private swapHistory;

    // Events
    event IdentityCreated(address indexed user, bytes32 indexed identityId);
    event ActiveIdentityChanged(address indexed user, bytes32 indexed identityId);
    event SwapExecuted(bytes32 indexed identityId, address inputToken, address outputToken);

    // Admin events (non-sensitive)
    event RouterConfigured(address router, uint24 fee);

    /**
     * @dev Constructor initializes the contract with OpenZeppelin patterns
     * Optional initializer to set router and default pool fee later via owner functions.
     * Keeping empty constructor preserves existing deploy scripts.
     */
    constructor() {
        // Initialize the counter (starts at 0, first increment will be 1)
        _identityCounter.reset();
    }

    /**
     * @dev Owner can set or update the Uniswap V3 router and fee. Setting router to address(0)
     * enables simulation mode for environments without a router (e.g., unit tests).
     */
    function setSwapRouter(address _router, uint24 _fee) external onlyOwner {
        swapRouter = _router;
        poolFee = _fee;
        emit RouterConfigured(_router, _fee);
    }

    /**
     * @dev Pause the contract - emergency stop functionality using OpenZeppelin's Pausable
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Create a new identity/persona. On Sapphire, state is encrypted at rest,
     * so we can store metadata directly. If client-side encryption is desired,
     * encrypt off-chain and pass the ciphertext here.
     * @param name Name of the identity
     * @param metadata Opaque metadata about the identity
     * @return identityId The ID of the created identity
     */
    function createIdentity(string memory name, bytes memory metadata) public whenNotPaused returns (bytes32) {
        // Generate a deterministic but unique identity ID using OpenZeppelin's Counter
        _identityCounter.increment();
        bytes32 identityId = keccak256(abi.encodePacked(msg.sender, name, _identityCounter.current(), block.timestamp));
        
        require(!identities[msg.sender][identityId].exists, "Identity already exists");
        
        // Store the metadata as-is. Sapphire ensures confidentiality in storage.
        // If you need additional confidentiality layers, encrypt off-chain.
        bytes memory encryptedData = metadata;
        
        // Store the identity with data
        identities[msg.sender][identityId] = Identity({
            name: name,
            encryptedData: encryptedData,
            exists: true
        });
        
        userIdentityIds[msg.sender].push(identityId);
        
        // If this is the user's first identity, set it as active
        if (activeIdentities[msg.sender] == bytes32(0)) {
            activeIdentities[msg.sender] = identityId;
        }
        
        emit IdentityCreated(msg.sender, identityId);
        
        return identityId;
    }

    /**
     * @dev Switch the active identity
     * @param identityId The ID of the identity to make active
     */
    function switchIdentity(bytes32 identityId) public whenNotPaused {
        require(identities[msg.sender][identityId].exists, "Identity does not exist");
        
        activeIdentities[msg.sender] = identityId;
        
        emit ActiveIdentityChanged(msg.sender, identityId);
    }

    /**
     * @dev Execute a token swap via Uniswap with confidentiality
     * @param inputToken Address of input token
     * @param outputToken Address of output token
     * @param amountIn Amount of input token
     * @param minAmountOut Minimum amount of output token expected
     * @return amountOut Actual amount of output token received
     */
    function swapTokens(
        address inputToken,
        address outputToken,
        uint256 amountIn,
        uint256 minAmountOut
    ) public nonReentrant whenNotPaused returns (uint256) {
        // Get the active persona/identity for this transaction
        bytes32 identityId = activeIdentities[msg.sender];
        require(identityId != bytes32(0), "No active identity");
        require(inputToken != address(0) && outputToken != address(0), "Invalid token");
        require(inputToken != outputToken, "Tokens must differ");
        require(amountIn > 0, "amountIn=0");
        
        // The following operations occur inside Oasis Sapphire's confidential execution environment
        // This means transaction details are hidden from public view
        
        uint256 amountOut;
        if (swapRouter == address(0)) {
            // Simulation mode (no router configured): maintain existing demo behavior
            amountOut = (amountIn * 98) / 100; // Simulated 2% slippage
            require(amountOut >= minAmountOut, "Slippage too high");
        } else {
            // Pull tokens from user (user must approve this contract for amountIn)
            IERC20(inputToken).safeTransferFrom(msg.sender, address(this), amountIn);

            // Approve router exactly for amountIn using SafeERC20
            IERC20(inputToken).safeApprove(swapRouter, amountIn);

            // Execute Uniswap V3 exactInputSingle
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: inputToken,
                tokenOut: outputToken,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: minAmountOut,
                sqrtPriceLimitX96: 0
            });

            amountOut = ISwapRouter(swapRouter).exactInputSingle(params);

            // Forward output tokens to the user
            IERC20(outputToken).safeTransfer(msg.sender, amountOut);
        }
        
        // Log the swap under the active identity - this history is confidential
        // and can only be accessed by the wallet owner
        logTrade(identityId, inputToken, outputToken, amountIn, amountOut);
        
        // This event emits minimal information (not revealing amounts)
        // The actual swap details are confidential
        emit SwapExecuted(identityId, inputToken, outputToken);
        
        return amountOut;
    }

    /**
     * @dev Log trade details under the specified identity
     * @param identityId ID of the identity to log under
     * @param inputToken Address of input token
     * @param outputToken Address of output token
     * @param amountIn Amount of input token
     * @param amountOut Amount of output token
     */
    function logTrade(
        bytes32 identityId,
        address inputToken,
        address outputToken,
        uint256 amountIn,
        uint256 amountOut
    ) internal {
        SwapDetails memory details = SwapDetails({
            inputToken: inputToken,
            outputToken: outputToken,
            amountIn: amountIn,
            amountOut: amountOut,
            timestamp: block.timestamp
        });
        
        swapHistory[identityId].push(details);
    }

    /**
     * @dev Get all identity IDs for a user
     * @return Array of identity IDs
     */
    function getIdentityIds() public view returns (bytes32[] memory) {
        return userIdentityIds[msg.sender];
    }

    /**
     * @dev Get identity details
     * @param identityId ID of the identity
     * @return name Name of the identity
     * @return metadata Metadata about the identity (opaque)
     */
    function getIdentity(bytes32 identityId) public view returns (string memory, bytes memory) {
        require(identities[msg.sender][identityId].exists, "Identity does not exist");
        
        Identity memory identity = identities[msg.sender][identityId];
        
        // On Sapphire, storage is confidential; return as-is
        bytes memory data = identity.encryptedData;
        
        return (identity.name, data);
    }

    /**
     * @dev Get the active identity for a user
     * @return Active identity ID
     */
    function getActiveIdentity() public view returns (bytes32) {
        return activeIdentities[msg.sender];
    }

    /**
     * @dev Get swap history for an identity
     * This function leverages Oasis Sapphire's confidential queries
     * @param identityId ID of the identity
     * @return Array of swap details (confidentially provided)
     */
    function getSwapHistory(bytes32 identityId) public view returns (SwapDetails[] memory) {
        require(identities[msg.sender][identityId].exists, "Identity does not exist");
        
        // Access to this data is confidential thanks to Sapphire's privacy features
        // Even though we're returning the data directly, it's protected by the confidential execution environment
        return swapHistory[identityId];
    }
    
    /**
     * @dev Add support for mid-trade persona switching
     * This function allows a user to switch personas during a trade flow,
     * effectively splitting the trade history across multiple personas
     * @param identityId New identity to switch to
     */
    function midTradeSwitch(bytes32 identityId, bool /* continueSwap */) public whenNotPaused {
        require(identities[msg.sender][identityId].exists, "Identity does not exist");
        
        // Switch to the new identity
        activeIdentities[msg.sender] = identityId;
        
        emit ActiveIdentityChanged(msg.sender, identityId);
        
        // Additional logic for continued swaps would go here in a full implementation
    }

    /**
     * @dev Get the current identity counter value (using OpenZeppelin's Counters)
     * @return Current counter value
     */
    function getIdentityCounter() public view returns (uint256) {
        return _identityCounter.current();
    }
}
