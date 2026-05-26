// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ReputationRegistry.sol";
import "./LpProtectionVault.sol";

abstract contract RepuFlowLogic {
    enum FlowQuality {
        Helpful,
        Neutral,
        Toxic
    }

    struct FeeBreakdown {
        uint24 baseFeeBps;
        int24 flowAdjustmentBps;
        uint24 reputationDiscountBps;
        uint24 finalFeeBps;
        uint24 surchargeBps;
        uint8 reputationScore;
        FlowQuality quality;
    }

    event FeeQuoted(
        address indexed trader,
        FlowQuality quality,
        uint8 reputationScore,
        uint24 finalFeeBps,
        uint24 surchargeBps
    );
    event SwapSettled(address indexed trader, FlowQuality quality, uint8 newReputationScore, uint24 surchargeBps);

    uint24 public constant MIN_FEE_BPS = 5;
    uint24 public constant BASE_FEE_BPS = 30;
    uint24 public constant MAX_FEE_BPS = 150;
    uint24 internal constant V4_FEE_UNITS_PER_BPS = 100;

    ReputationRegistry public immutable registry;
    LpProtectionVault public immutable vault;

    constructor(ReputationRegistry registry_, LpProtectionVault vault_) {
        registry = registry_;
        vault = vault_;
    }

    function quoteSwap(address trader, int256 amountSpecified, uint160 poolImbalanceBps)
        public
        view
        returns (FeeBreakdown memory breakdown)
    {
        uint8 score = registry.scoreOf(trader);
        FlowQuality quality = classifyFlow(amountSpecified, poolImbalanceBps);
        int24 flowAdjustment = flowAdjustmentFor(quality);
        uint24 discount = reputationDiscountFor(score);
        uint24 finalFee = clampFee(int24(uint24(BASE_FEE_BPS)) + flowAdjustment - int24(uint24(discount)));
        uint24 surcharge = finalFee > BASE_FEE_BPS ? finalFee - BASE_FEE_BPS : 0;

        breakdown = FeeBreakdown({
            baseFeeBps: BASE_FEE_BPS,
            flowAdjustmentBps: flowAdjustment,
            reputationDiscountBps: discount,
            finalFeeBps: finalFee,
            surchargeBps: surcharge,
            reputationScore: score,
            quality: quality
        });
    }

    function classifyFlow(int256 amountSpecified, uint160 poolImbalanceBps) public pure returns (FlowQuality) {
        uint256 absoluteAmount = amountSpecified < 0 ? uint256(-amountSpecified) : uint256(amountSpecified);

        if (absoluteAmount >= 10 ether || poolImbalanceBps >= 700) {
            return FlowQuality.Toxic;
        }

        if (amountSpecified < 0 && poolImbalanceBps >= 200) {
            return FlowQuality.Helpful;
        }

        return FlowQuality.Neutral;
    }

    function flowAdjustmentFor(FlowQuality quality) public pure returns (int24) {
        if (quality == FlowQuality.Helpful) return -10;
        if (quality == FlowQuality.Toxic) return 80;
        return 0;
    }

    function reputationDiscountFor(uint8 score) public pure returns (uint24) {
        if (score >= 90) return 10;
        if (score >= 80) return 8;
        if (score >= 70) return 5;
        return 0;
    }

    function scoreDeltaFor(FlowQuality quality) public pure returns (int16) {
        if (quality == FlowQuality.Helpful) return 2;
        if (quality == FlowQuality.Toxic) return -8;
        return 1;
    }

    function clampFee(int24 rawFee) public pure returns (uint24) {
        if (rawFee < int24(uint24(MIN_FEE_BPS))) return MIN_FEE_BPS;
        if (rawFee > int24(uint24(MAX_FEE_BPS))) return MAX_FEE_BPS;
        return uint24(rawFee);
    }

    function finalFeeAsV4Units(uint24 feeBps) public pure returns (uint24) {
        return feeBps * V4_FEE_UNITS_PER_BPS;
    }

    function _settleRepuFlowSwap(address trader, int256 amountSpecified, uint160 poolImbalanceBps)
        internal
        returns (uint8 newScore, FeeBreakdown memory breakdown)
    {
        breakdown = quoteSwap(trader, amountSpecified, poolImbalanceBps);
        newScore = registry.adjustScore(trader, scoreDeltaFor(breakdown.quality));

        if (breakdown.surchargeBps > 0) {
            vault.recordProtection(trader, breakdown.surchargeBps);
        }

        emit SwapSettled(trader, breakdown.quality, newScore, breakdown.surchargeBps);
    }
}

