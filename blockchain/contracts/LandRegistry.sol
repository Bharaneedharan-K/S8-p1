// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    
    struct Land {
        uint256 id;
        string surveyNumber;
        string landHash; // SHA256 hash of land details
        address owner;
        uint256 timestamp;
        bool isRegistered;
    }

    mapping(string => Land) public lands; // Mapping from surveyNumber to Land
    mapping(uint256 => string) public surveyNumbers; // To simulate array if needed
    uint256 public totalLands;

    event LandRegistered(string indexed surveyNumber, string landHash, uint256 timestamp, address indexed registeredBy);

    constructor() {
        totalLands = 0;
    }

    function registerLand(string memory _surveyNumber, string memory _landHash) public {
        require(!lands[_surveyNumber].isRegistered, "Land with this Survey Number already registered");

        totalLands++;
        lands[_surveyNumber] = Land(
            totalLands,
            _surveyNumber,
            _landHash,
            msg.sender,
            block.timestamp,
            true
        );

        surveyNumbers[totalLands] = _surveyNumber;

        emit LandRegistered(_surveyNumber, _landHash, block.timestamp, msg.sender);
    }

    function getLand(string memory _surveyNumber) public view returns (uint256, string memory, string memory, address, uint256) {
        require(lands[_surveyNumber].isRegistered, "Land not found");
        Land memory l = lands[_surveyNumber];
        return (l.id, l.surveyNumber, l.landHash, l.owner, l.timestamp);
    }
}
