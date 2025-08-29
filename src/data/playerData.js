// This module handles loading and saving persistent player data.
const PLAYER_DATA_KEY = 'space_survivor_player_data';

// Default data structure for a new player
const defaultData = {
    gold: 0,
    globalUpgrades: {},
    hasWonGame: false
};

// The cached player data object
let playerData = null;

/**
 * Loads player data from localStorage. If no data exists, it initializes with default values.
 * @returns {object} The player data object.
 */
export function loadPlayerData() {
    if (playerData) {
        return playerData; // Return cached data if already loaded
    }

    try {
        const savedData = localStorage.getItem(PLAYER_DATA_KEY);
        if (savedData) {
            playerData = JSON.parse(savedData);
        } else {
            // No saved data, initialize with defaults
            playerData = { ...defaultData };
            savePlayerData();
        }
    } catch (error) {
        console.error("Could not load player data from localStorage. Using default data.", error);
        playerData = { ...defaultData };
    }
    return playerData;
}

/**
 * Saves the current player data object to localStorage.
 */
export function savePlayerData() {
    if (!playerData) {
        console.error("Cannot save player data before it has been loaded.");
        return;
    }
    try {
        const dataToSave = JSON.stringify(playerData);
        localStorage.setItem(PLAYER_DATA_KEY, dataToSave);
    } catch (error) {
        console.error("Could not save player data to localStorage.", error);
    }
}

/**
 * Gets the entire player data object.
 * @returns {object}
 */
export function getPlayerData() {
    return loadPlayerData();
}

/**
 * Adds a specified amount of gold to the player's total and saves the data.
 * @param {number} amount - The amount of gold to add.
 */
export function addGold(amount) {
    if (amount === 0) return; // Allow for negative amounts (spending gold)
    playerData.gold += amount;
    savePlayerData();
}

/**
 * Gets the current gold total.
 * @returns {number}
 */
export function getGold() {
    return loadPlayerData().gold;
}
