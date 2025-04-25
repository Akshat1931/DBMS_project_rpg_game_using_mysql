import React, { useState, useEffect } from 'react';

// Player Report component that shows detailed player statistics
const PlayerReport = ({ playerId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [worldStatus, setWorldStatus] = useState(null);
  
  // Load player data and world status on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Create API client instance
        const apiClient = new window.APIClient();
        
        // Fetch player data
        const playerResult = await apiClient.getPlayer(playerId);
        if (!playerResult.success) {
          throw new Error(playerResult.error);
        }
        
        setPlayerData(playerResult.data);
        
        // Fetch world status
        const worldResult = await apiClient.getWorldStatus();
        if (worldResult.success) {
          setWorldStatus(worldResult.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError(err.message || 'Failed to load player data');
      } finally {
        setLoading(false);
      }
    };
    
    if (playerId) {
      fetchData();
    }
  }, [playerId]);
  
  // Handle report download
  const handleDownloadReport = async () => {
    if (!playerId) return;
    
    try {
      const apiClient = new window.APIClient();
      await apiClient.downloadPlayerReport(playerId, `player-${playerId}-report.html`);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report: ' + err.message);
    }
  };
  
  // Format number with commas for readability
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Calculate XP needed for the next level
  const calculateXPForNextLevel = (level) => {
    return Math.round(2 ** level * 100);
  };
  
  // Calculate total XP required to reach current level
  const calculateTotalXPForLevel = (level) => {
    if (level <= 1) return 0;
    
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += Math.round(2 ** (i - 1) * 100);
    }
    return totalXP;
  };
  
  // Calculate level progress
  const calculateLevelProgress = () => {
    if (!playerData) return 0;
    
    const level = playerData.level || 1;
    const experience = playerData.experience || 0;
    const currentLevelXP = calculateTotalXPForLevel(level);
    const nextLevelXP = calculateXPForNextLevel(level);
    
    const progress = experience - currentLevelXP;
    return Math.min(100, Math.floor((progress / nextLevelXP) * 100));
  };
  
  // If loading, show spinner
  if (loading) {
    return (
      <div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg text-center">
        <div className="flex justify-center items-center h-48">
          <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-300 mt-4">Loading adventurer data...</p>
      </div>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <div className="w-full p-6 bg-red-900/50 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p className="text-white">{error}</p>
      </div>
    );
  }
  
  // If no player data, show message
  if (!playerData) {
    return (
      <div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-300 mb-2">No Player Data</h2>
        <p className="text-gray-400">Player data not available.</p>
      </div>
    );
  }
  
  // Calculate health percentage
  const healthPercent = Math.floor((playerData.health / playerData.max_health) * 100);
  
  // Calculate level progress
  const levelProgress = calculateLevelProgress();
  
  // Determine next level XP
  const nextLevelXP = calculateXPForNextLevel(playerData.level || 1);
  const totalXPForNextLevel = calculateTotalXPForLevel(playerData.level || 1) + nextLevelXP;

  return (
    <div className="w-full bg-gray-900/90 rounded-lg shadow-lg overflow-hidden border border-purple-900/50">
      {/* Report Header */}
      <div className="p-6 bg-gradient-to-r from-purple-900/70 to-indigo-900/70">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Adventurer Profile</h2>
          <button 
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition duration-200 shadow-md flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download Report
          </button>
        </div>
      </div>
      
      {/* Character Info */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-500 mb-4">Character Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-bold">{playerData.username || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Level</p>
                <p className="text-white font-bold">{playerData.level || 1}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Health</p>
                <div className="flex items-center">
                  <p className="text-white font-bold mr-2">
                    {playerData.health || 0} / {playerData.max_health || 100}
                  </p>
                  <span className="text-xs text-white bg-gray-700 px-2 py-0.5 rounded-full">
                    {healthPercent}%
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      healthPercent > 60 ? 'bg-green-500' : 
                      healthPercent > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${healthPercent}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Experience</p>
                <div className="flex items-center">
                  <p className="text-white font-bold mr-2">
                    {formatNumber(playerData.experience || 0)}
                  </p>
                  <span className="text-xs text-white bg-gray-700 px-2 py-0.5 rounded-full">
                    {levelProgress}%
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500" 
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatNumber(nextLevelXP)} XP needed for level {(playerData.level || 1) + 1}
                </p>
              </div>
            </div>
          </div>
          
          {worldStatus && (
            <div className="md:w-1/3 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-bold text-yellow-500 mb-4">World Status</h3>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    worldStatus.world_time?.day_cycle === 'Night' ? 'bg-indigo-900 text-blue-300' : 
                    'bg-yellow-800 text-yellow-300'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      {worldStatus.world_time?.day_cycle === 'Night' ? (
                        <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                      ) : (
                        <circle cx="12" cy="12" r="5" />
                      )}
                    </svg>
                  </span>
                  <div>
                    <p className="text-white font-bold">{worldStatus.world_time?.day_cycle || 'Day'}</p>
                    <p className="text-xs text-gray-400">Time of Day</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-blue-900 text-blue-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      {worldStatus.world_time?.weather === 'Rainy' ? (
                        <path d="M12 4.5c2.76 0 5 2.24 5 5 0 .51-.1 1-.24 1.46C15.63 10.5 14.11 10 12.5 10c-3.21 0-5.92 2.37-6.37 5.47a4.53 4.53 0 0 1-.63-2.28c0-2.76 2.24-5 5-5V4.5m3 10c-.48-.77-1.23-1.3-2.11-1.41-.34-.04-.68-.06-1.02-.06-2.36 0-4.5 1.01-6 2.92.66.22 1.23.59 1.62 1.07C8.32 18.4 9.82 19 11.5 19c3.12 0 5.5-2.38 5.5-5.5 0-1.04-.29-2.01-.79-2.83-.32 1.04-.97 1.93-1.84 2.53-.87.6-1.92.95-3.02.98a5.66 5.66 0 0 0 3.65 1.32"/>
                      ) : worldStatus.world_time?.weather === 'Stormy' ? (
                        <path d="M6 16.5l-4 4v-7m16 7v-4.5m0 0a7 7 0 0 0-7-7h-1a7 7 0 0 0-7 7m8-10v1"/>
                      ) : worldStatus.world_time?.weather === 'Cloudy' ? (
                        <path d="M4.5 9.5c0-1.3.58-2.54 1.6-3.36a4.5 4.5 0 0 1 6.4.36A4.53 4.53 0 0 1 16.5 7.5a4.53 4.53 0 0 1 1.08 2.97c.95.34 1.72 1.12 2.04 2.13.59.05 1.13.27 1.55.65.43.37.73.89.83 1.47v.08a3 3 0 0 1-.83 2.12c-.42.45-1 .76-1.65.85H7.32c-.88-.09-1.68-.47-2.22-1.05a3.1 3.1 0 0 1-.8-2.28v-.15a3.09 3.09 0 0 1 .98-2.08 3.24 3.24 0 0 1 2.17-.75 1.5 1.5 0 0 0 1.46-1.08A3.1 3.1 0 0 1 11 8.5a3 3 0 0 1 1.83.62 3 3 0 0 1 1.05 1.62 4.58 4.58 0 0 1 2.46 4.08"/>
                      ) : worldStatus.world_time?.weather === 'Foggy' ? (
                        <path d="M13 12h7m-7 4h7m-7-8h7M5 12h2.5M5 16h2.5M5 8h2.5M3 20h18M3 4h18"/>
                      ) : (
                        <circle cx="12" cy="12" r="5" />
                      )}
                    </svg>
                  </span>
                  <div>
                    <p className="text-white font-bold">{worldStatus.world_time?.weather || 'Clear'}</p>
                    <p className="text-xs text-gray-400">Weather</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                <p><span className="text-yellow-500 font-bold">Effects:</span> {worldStatus.environment?.effects || 'Normal conditions'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Attributes */}
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-lg font-bold text-yellow-500 mb-4">Attributes</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-red-900/60 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-red-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </span>
              <p className="text-gray-300 font-bold">Strength</p>
            </div>
            <p className="text-2xl font-bold text-white">{playerData.strength || 0}</p>
            <p className="text-xs text-gray-400">Physical damage & carrying capacity</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-blue-900/60 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
              </span>
              <p className="text-gray-300 font-bold">Wisdomness</p>
            </div>
            <p className="text-2xl font-bold text-white">{playerData.wisdomness || 0}</p>
            <p className="text-xs text-gray-400">Magic resistance & spell discovery</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-green-900/60 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                </svg>
              </span>
              <p className="text-gray-300 font-bold">Benchpress</p>
            </div>
            <p className="text-2xl font-bold text-white">{playerData.benchpress || 0}</p>
            <p className="text-xs text-gray-400">Heavy weapon proficiency</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-yellow-900/60 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </span>
              <p className="text-gray-300 font-bold">Curl</p>
            </div>
            <p className="text-2xl font-bold text-white">{playerData.curl || 0}</p>
            <p className="text-xs text-gray-400">Precision & one-handed weapons</p>
          </div>
        </div>
      </div>
      
      {/* Progress & Achievements */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-yellow-500 mb-4">Progression</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <p className="text-gray-300">Level Progress</p>
                <p className="text-white font-bold">{levelProgress}%</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <p>Level {playerData.level || 1}</p>
                <p>{formatNumber(playerData.experience || 0)} / {formatNumber(totalXPForNextLevel)} XP</p>
                <p>Level {(playerData.level || 1) + 1}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <p className="text-gray-300">Health</p>
                <p className="text-white font-bold">{playerData.health || 0} / {playerData.max_health || 100}</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    healthPercent > 60 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                    healthPercent > 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                    'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${healthPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <span className="w-8 h-8 bg-purple-900/60 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4zm10 15c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-5h14v5zm0-7H5V9h14v3z"/>
                  </svg>
                </span>
                <p className="text-gray-300 font-bold">Achievements & Milestones</p>
              </div>
              
              <div className="space-y-2">
                {playerData.level >= 5 && (
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-yellow-400 mr-2">★</span>
                    <p className="text-white">Apprentice Adventurer (Level 5+)</p>
                  </div>
                )}
                
                {playerData.level >= 10 && (
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-yellow-400 mr-2">★</span>
                    <p className="text-white">Seasoned Explorer (Level 10+)</p>
                  </div>
                )}
                
                {playerData.level >= 20 && (
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-yellow-400 mr-2">★</span>
                    <p className="text-white">Veteran Hero (Level 20+)</p>
                  </div>
                )}
                
                {playerData.strength >= 75 && (
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-red-400 mr-2">★</span>
                    <p className="text-white">Mighty Warrior (75+ Strength)</p>
                  </div>
                )}
                
                {playerData.wisdomness >= 75 && (
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-blue-400 mr-2">★</span>
                    <p className="text-white">Wise Sage (75+ Wisdomness)</p>
                  </div>
                )}
                
                {(playerData.level < 5 && playerData.strength < 75 && playerData.wisdomness < 75) && (
                  <p className="text-gray-400 italic text-sm">Continue your adventure to unlock achievements!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-gray-800 text-center text-gray-400 text-sm">
        Fantasy Protocol Game Report • Generated {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default PlayerReport;