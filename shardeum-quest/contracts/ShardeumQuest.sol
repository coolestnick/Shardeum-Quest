// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ShardeumQuest {
    struct Quest {
        string title;
        string description;
        uint256 xpReward;
        bool isActive;
    }

    struct UserProgress {
        uint256 totalXP;
        uint256 completedQuests;
        mapping(uint256 => bool) completedQuestIds;
        uint256[] achievements;
    }

    struct Achievement {
        string name;
        string description;
        string imageUrl;
        uint256 requiredXP;
    }

    address public owner;
    uint256 public questCounter;
    uint256 public achievementCounter;
    
    mapping(uint256 => Quest) public quests;
    mapping(address => UserProgress) public userProgress;
    mapping(uint256 => Achievement) public achievements;
    
    event QuestCompleted(address indexed user, uint256 indexed questId, uint256 xpEarned);
    event AchievementUnlocked(address indexed user, uint256 indexed achievementId);
    event QuestCreated(uint256 indexed questId, string title, uint256 xpReward);
    event UserRegistered(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        _initializeDefaultQuests();
        _initializeAchievements();
    }

    function _initializeDefaultQuests() private {
        createQuest("Welcome to DeFi", "Complete your first transaction on Shardeum", 100);
        createQuest("Token Explorer", "Learn about ERC-20 tokens and standards", 150);
        createQuest("Liquidity Master", "Understand liquidity pools and AMMs", 200);
        createQuest("Yield Farmer", "Learn about yield farming strategies", 250);
        createQuest("DeFi Strategist", "Master advanced DeFi concepts", 300);
    }

    function _initializeAchievements() private {
        createAchievement("DeFi Novice", "Complete your first quest", "ipfs://QmNovice", 100);
        createAchievement("Token Scholar", "Earn 500 XP", "ipfs://QmScholar", 500);
        createAchievement("Liquidity Expert", "Earn 1000 XP", "ipfs://QmExpert", 1000);
        createAchievement("DeFi Master", "Complete all quests", "ipfs://QmMaster", 2000);
    }

    function createQuest(string memory _title, string memory _description, uint256 _xpReward) public onlyOwner {
        questCounter++;
        quests[questCounter] = Quest(_title, _description, _xpReward, true);
        emit QuestCreated(questCounter, _title, _xpReward);
    }

    function createAchievement(string memory _name, string memory _description, string memory _imageUrl, uint256 _requiredXP) public onlyOwner {
        achievementCounter++;
        achievements[achievementCounter] = Achievement(_name, _description, _imageUrl, _requiredXP);
    }

    function registerUser() public {
        require(userProgress[msg.sender].totalXP == 0, "User already registered");
        emit UserRegistered(msg.sender);
    }

    function completeQuest(uint256 _questId) public {
        require(_questId > 0 && _questId <= questCounter, "Invalid quest ID");
        require(quests[_questId].isActive, "Quest is not active");
        require(!userProgress[msg.sender].completedQuestIds[_questId], "Quest already completed");

        Quest memory quest = quests[_questId];
        
        userProgress[msg.sender].completedQuestIds[_questId] = true;
        userProgress[msg.sender].totalXP += quest.xpReward;
        userProgress[msg.sender].completedQuests++;

        emit QuestCompleted(msg.sender, _questId, quest.xpReward);

        _checkAndUnlockAchievements(msg.sender);
    }

    function _checkAndUnlockAchievements(address _user) private {
        uint256 userXP = userProgress[_user].totalXP;
        
        for (uint256 i = 1; i <= achievementCounter; i++) {
            if (userXP >= achievements[i].requiredXP && !hasAchievement(_user, i)) {
                userProgress[_user].achievements.push(i);
                emit AchievementUnlocked(_user, i);
            }
        }
    }

    function hasAchievement(address _user, uint256 _achievementId) public view returns (bool) {
        uint256[] memory userAchievements = userProgress[_user].achievements;
        for (uint256 i = 0; i < userAchievements.length; i++) {
            if (userAchievements[i] == _achievementId) {
                return true;
            }
        }
        return false;
    }

    function getUserStats(address _user) public view returns (
        uint256 totalXP,
        uint256 completedQuests,
        uint256[] memory achievementIds
    ) {
        return (
            userProgress[_user].totalXP,
            userProgress[_user].completedQuests,
            userProgress[_user].achievements
        );
    }

    function hasCompletedQuest(address _user, uint256 _questId) public view returns (bool) {
        return userProgress[_user].completedQuestIds[_questId];
    }

    function getActiveQuests() public view returns (uint256[] memory, string[] memory, uint256[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= questCounter; i++) {
            if (quests[i].isActive) {
                activeCount++;
            }
        }
        
        uint256[] memory ids = new uint256[](activeCount);
        string[] memory titles = new string[](activeCount);
        uint256[] memory rewards = new uint256[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= questCounter; i++) {
            if (quests[i].isActive) {
                ids[index] = i;
                titles[index] = quests[i].title;
                rewards[index] = quests[i].xpReward;
                index++;
            }
        }
        
        return (ids, titles, rewards);
    }

    function toggleQuestActive(uint256 _questId) public onlyOwner {
        require(_questId > 0 && _questId <= questCounter, "Invalid quest ID");
        quests[_questId].isActive = !quests[_questId].isActive;
    }
}