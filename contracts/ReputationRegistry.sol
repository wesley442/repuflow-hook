// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ReputationRegistry {
    error NotAuthorized();

    event ScoreSet(address indexed trader, uint8 score);
    event ScoreAdjusted(address indexed trader, uint8 previousScore, uint8 newScore, int16 delta);

    address public owner;
    mapping(address => bool) public scoreWriters;
    mapping(address => uint8) private scores;
    mapping(address => bool) private initialized;

    constructor() {
        owner = msg.sender;
        scoreWriters[msg.sender] = true;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier onlyWriter() {
        if (!scoreWriters[msg.sender]) revert NotAuthorized();
        _;
    }

    function setScoreWriter(address writer, bool allowed) external onlyOwner {
        scoreWriters[writer] = allowed;
    }

    function setScore(address trader, uint8 score) external onlyWriter {
        require(score <= 100, "score > 100");
        scores[trader] = score;
        initialized[trader] = true;
        emit ScoreSet(trader, score);
    }

    function scoreOf(address trader) external view returns (uint8) {
        if (!initialized[trader]) return 50;
        return scores[trader];
    }

    function adjustScore(address trader, int16 delta) external onlyWriter returns (uint8 newScore) {
        uint8 previousScore = initialized[trader] ? scores[trader] : 50;
        int16 rawScore = int16(uint16(previousScore)) + delta;

        if (rawScore < 0) {
            newScore = 0;
        } else if (rawScore > 100) {
            newScore = 100;
        } else {
            newScore = uint8(uint16(rawScore));
        }

        scores[trader] = newScore;
        initialized[trader] = true;
        emit ScoreAdjusted(trader, previousScore, newScore, delta);
    }
}

