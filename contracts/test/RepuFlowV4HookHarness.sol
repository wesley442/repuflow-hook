// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

import "../LpProtectionVault.sol";
import "../ReputationRegistry.sol";
import "../RepuFlowV4Hook.sol";

contract RepuFlowV4HookHarness is RepuFlowV4Hook {
    constructor(IPoolManager manager, ReputationRegistry registry_, LpProtectionVault vault_)
        RepuFlowV4Hook(manager, registry_, vault_)
    {}

    function validateHookAddress(BaseHook) internal pure override {}

    function exposedBeforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata hookData)
        external
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        return _beforeSwap(sender, key, params, hookData);
    }

    function exposedAfterSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata hookData)
        external
        returns (bytes4, int128)
    {
        return _afterSwap(sender, key, params, BalanceDeltaLibrary.ZERO_DELTA, hookData);
    }
}

