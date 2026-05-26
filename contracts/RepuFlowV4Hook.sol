// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

import "./LpProtectionVault.sol";
import "./ReputationRegistry.sol";
import "./RepuFlowLogic.sol";

contract RepuFlowV4Hook is BaseHook, RepuFlowLogic {
    constructor(IPoolManager manager, ReputationRegistry registry_, LpProtectionVault vault_)
        BaseHook(manager)
        RepuFlowLogic(registry_, vault_)
    {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function _beforeSwap(address sender, PoolKey calldata, SwapParams calldata params, bytes calldata hookData)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        uint160 poolImbalanceBps = _decodePoolImbalanceBps(hookData);
        FeeBreakdown memory breakdown = quoteSwap(sender, params.amountSpecified, poolImbalanceBps);
        uint24 v4Fee = finalFeeAsV4Units(breakdown.finalFeeBps) | LPFeeLibrary.OVERRIDE_FEE_FLAG;

        emit FeeQuoted(sender, breakdown.quality, breakdown.reputationScore, breakdown.finalFeeBps, breakdown.surchargeBps);

        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, v4Fee);
    }

    function _afterSwap(
        address sender,
        PoolKey calldata,
        SwapParams calldata params,
        BalanceDelta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        uint160 poolImbalanceBps = _decodePoolImbalanceBps(hookData);
        _settleRepuFlowSwap(sender, params.amountSpecified, poolImbalanceBps);
        return (IHooks.afterSwap.selector, 0);
    }

    function _decodePoolImbalanceBps(bytes calldata hookData) internal pure returns (uint160) {
        if (hookData.length == 0) return 0;
        return abi.decode(hookData, (uint160));
    }
}

