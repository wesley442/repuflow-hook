// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LpProtectionVault {
    error NotAuthorized();

    event ProtectionRecorded(address indexed trader, uint24 surchargeBps, uint256 newTotalBps);

    address public owner;
    mapping(address => bool) public recorders;
    uint256 public totalProtectionBps;

    constructor() {
        owner = msg.sender;
        recorders[msg.sender] = true;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier onlyRecorder() {
        if (!recorders[msg.sender]) revert NotAuthorized();
        _;
    }

    function setRecorder(address recorder, bool allowed) external onlyOwner {
        recorders[recorder] = allowed;
    }

    function recordProtection(address trader, uint24 surchargeBps) external onlyRecorder {
        totalProtectionBps += surchargeBps;
        emit ProtectionRecorded(trader, surchargeBps, totalProtectionBps);
    }
}

