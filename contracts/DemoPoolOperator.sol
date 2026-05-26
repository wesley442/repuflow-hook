// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20Minimal} from "@uniswap/v4-core/src/interfaces/external/IERC20Minimal.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {TransientStateLibrary} from "@uniswap/v4-core/src/libraries/TransientStateLibrary.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

contract DemoPoolOperator is IUnlockCallback {
    using BalanceDeltaLibrary for BalanceDelta;
    using CurrencyLibrary for Currency;
    using TransientStateLibrary for IPoolManager;

    enum Action {
        ModifyLiquidity,
        Swap
    }

    struct CallbackData {
        Action action;
        address sender;
        PoolKey key;
        ModifyLiquidityParams liquidityParams;
        SwapParams swapParams;
        bytes hookData;
    }

    IPoolManager public immutable manager;

    constructor(IPoolManager manager_) {
        manager = manager_;
    }

    function buildKey(address tokenA, address tokenB, address hook)
        public
        pure
        returns (PoolKey memory key)
    {
        (address currency0, address currency1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        key = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
            tickSpacing: 60,
            hooks: IHooks(hook)
        });
    }

    function poolId(PoolKey memory key) external pure returns (PoolId) {
        return key.toId();
    }

    function initialize(PoolKey memory key) external returns (int24 tick) {
        tick = manager.initialize(key, TickMath.getSqrtPriceAtTick(0));
    }

    function addWideLiquidity(PoolKey memory key, uint256 liquidity, bytes calldata hookData)
        external
        returns (BalanceDelta delta)
    {
        ModifyLiquidityParams memory params = ModifyLiquidityParams({
            tickLower: TickMath.minUsableTick(key.tickSpacing),
            tickUpper: TickMath.maxUsableTick(key.tickSpacing),
            liquidityDelta: int256(liquidity),
            salt: bytes32(0)
        });

        delta = abi.decode(
            manager.unlock(abi.encode(CallbackData(Action.ModifyLiquidity, msg.sender, key, params, SwapParams(false, 0, 0), hookData))),
            (BalanceDelta)
        );
    }

    function swap(PoolKey memory key, SwapParams memory params, bytes calldata hookData)
        external
        returns (BalanceDelta delta)
    {
        delta = abi.decode(
            manager.unlock(abi.encode(CallbackData(Action.Swap, msg.sender, key, ModifyLiquidityParams(0, 0, 0, bytes32(0)), params, hookData))),
            (BalanceDelta)
        );
    }

    function unlockCallback(bytes calldata rawData) external returns (bytes memory) {
        require(msg.sender == address(manager), "not manager");
        CallbackData memory data = abi.decode(rawData, (CallbackData));

        if (data.action == Action.ModifyLiquidity) {
            (BalanceDelta delta,) = manager.modifyLiquidity(data.key, data.liquidityParams, data.hookData);
            _settleDelta(data.key, data.sender);
            return abi.encode(delta);
        }

        BalanceDelta swapDelta = manager.swap(data.key, data.swapParams, data.hookData);
        _settleDelta(data.key, data.sender);
        return abi.encode(swapDelta);
    }

    function _settleDelta(PoolKey memory key, address sender) internal {
        int256 delta0 = manager.currencyDelta(address(this), key.currency0);
        int256 delta1 = manager.currencyDelta(address(this), key.currency1);

        if (delta0 < 0) _settle(key.currency0, sender, uint256(-delta0));
        if (delta1 < 0) _settle(key.currency1, sender, uint256(-delta1));
        if (delta0 > 0) manager.take(key.currency0, sender, uint256(delta0));
        if (delta1 > 0) manager.take(key.currency1, sender, uint256(delta1));
    }

    function _settle(Currency currency, address payer, uint256 amount) internal {
        manager.sync(currency);
        IERC20Minimal(Currency.unwrap(currency)).transferFrom(payer, address(manager), amount);
        manager.settle();
    }
}
