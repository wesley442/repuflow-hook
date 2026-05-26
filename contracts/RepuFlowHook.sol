// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ReputationRegistry.sol";
import "./LpProtectionVault.sol";
import "./RepuFlowLogic.sol";

contract RepuFlowHook is RepuFlowLogic {
    constructor(ReputationRegistry registry_, LpProtectionVault vault_) RepuFlowLogic(registry_, vault_) {}

    function previewBeforeSwap(address trader, int256 amountSpecified, uint160 poolImbalanceBps)
        external
        returns (FeeBreakdown memory breakdown)
    {
        breakdown = quoteSwap(trader, amountSpecified, poolImbalanceBps);
        emit FeeQuoted(trader, breakdown.quality, breakdown.reputationScore, breakdown.finalFeeBps, breakdown.surchargeBps);
    }

    function settleAfterSwap(address trader, int256 amountSpecified, uint160 poolImbalanceBps)
        external
        returns (uint8 newScore)
    {
        (newScore,) = _settleRepuFlowSwap(trader, amountSpecified, poolImbalanceBps);
    }
}
