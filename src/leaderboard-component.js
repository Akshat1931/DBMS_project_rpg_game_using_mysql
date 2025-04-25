// src/leaderboard-component.js - Updated with fixed syntax for older browsers

const LeaderboardComponent = () => {
  const [leaderboardData, setLeaderboardData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [worldStatus, setWorldStatus] = React.useState(null);

  React.useEffect(() => {
    // Fetch leaderboard data when component mounts
    fetchLeaderboardData();
    // Also fetch world status
    fetchWorldStatus();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      // Use the dedicated leaderboard endpoint for properly formatted data
      const response = await fetch('http://localhost:3000/api/leaderboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate the data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid leaderboard data format');
      }
      
      setLeaderboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchWorldStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/world/status');
      if (!response.ok) {
        // Silently fail - world status is optional
        return;
      }

      const data = await response.json();
      setWorldStatus(data);
    } catch (err) {
      console.error('Error fetching world status:', err);
      // Silently fail - world status is optional
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboardData();
    fetchWorldStatus();
  };
  
  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Safely get world time day cycle
  const getWorldTimeDayCycle = () => {
    if (worldStatus && worldStatus.world_time && worldStatus.world_time.day_cycle) {
      return worldStatus.world_time.day_cycle;
    }
    return 'Day';
  };
  
  // Safely get world time weather
  const getWorldTimeWeather = () => {
    if (worldStatus && worldStatus.world_time && worldStatus.world_time.weather) {
      return worldStatus.world_time.weather;
    }
    return 'Clear';
  };
  
  // Safely get generated timestamp
  const getGeneratedTimestamp = () => {
    if (worldStatus && worldStatus.generated_at) {
      return worldStatus.generated_at;
    }
    return Date.now();
  };
  
  // Safely get active players count
  const getActivePlayers = () => {
    if (worldStatus && worldStatus.players && worldStatus.players.active) {
      return worldStatus.players.active;
    }
    return 0;
  };
  
  // Safely get regions data
  const getRegions = () => {
    if (worldStatus && worldStatus.players && worldStatus.players.regions) {
      return worldStatus.players.regions;
    }
    return [];
  };

  return React.createElement('div', { 
    className: 'leaderboard-container', 
    style: { 
      backgroundColor: 'rgba(1.0, 1.0, 1.0, 0.75)',
      padding: '20px',
      borderRadius: '10px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: worldStatus ? '600px' : '400px',
      overflowY: 'auto',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      animation: 'fadeIn 0.5s ease-in forwards',
      animationDelay: '0.3s',
      opacity: 0,
    }
  },
    // Header row with title and refresh button
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }
    },
      React.createElement('h3', { 
        style: { 
          color: 'white',
          margin: 0,
          fontFamily: "'IM Fell French Canon', serif",
          fontSize: '1.8rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }
      }, 'Top Adventurers'),
      
      React.createElement('button', {
        onClick: handleRefresh,
        disabled: refreshing || loading,
        style: {
          backgroundColor: refreshing || loading ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e5ac5c',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: refreshing || loading ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.9rem',
          fontFamily: "'IM Fell English', serif",
          transition: 'all 0.3s ease'
        }
      },
        refreshing && React.createElement('span', {
          style: {
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            borderTopColor: 'white',
            animation: 'spin 1s linear infinite'
          }
        }),
        React.createElement('span', null, refreshing ? 'Refreshing...' : 'Refresh')
      )
    ),
    
    loading && !refreshing 
      ? React.createElement('div', { 
          style: { 
            textAlign: 'center', 
            padding: '40px 0',
            color: 'white' 
          } 
        },
        React.createElement('div', {
          style: {
            display: 'inline-block',
            width: '30px',
            height: '30px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            borderTopColor: 'white',
            animation: 'spin 1s linear infinite',
            marginBottom: '10px'
          }
        }),
        React.createElement('p', null, 'Loading adventurers...')
      )
      : error 
        ? React.createElement('p', { style: { color: '#f44336', textAlign: 'center', padding: '20px' } }, error)
        : leaderboardData.length === 0
          ? React.createElement('p', { style: { color: 'white', textAlign: 'center', padding: '20px' } }, 'No adventurers found. Be the first to join!')
          : React.createElement('table', { 
              style: { 
                width: '100%', 
                color: 'white',
                borderCollapse: 'collapse',
                fontFamily: "'IM Fell English', serif"
              }
            },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', { 
                    style: { 
                      padding: '10px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      width: '60px',
                      color: '#e5ac5c'
                    } 
                  }, 'Rank'),
                  React.createElement('th', { 
                    style: { 
                      padding: '10px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#e5ac5c'
                    } 
                  }, 'Adventurer'),
                  React.createElement('th', { 
                    style: { 
                      padding: '10px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#e5ac5c'
                    } 
                  }, 'Level'),
                  React.createElement('th', { 
                    style: { 
                      padding: '10px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#e5ac5c'
                    } 
                  }, 'XP')
                )
              ),
              React.createElement('tbody', null,
                leaderboardData.map((player, index) => {
                  const rank = player.rank || index + 1;
                  return React.createElement('tr', { 
                    key: player.id,
                    style: { 
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      transition: 'background-color 0.3s'
                    }
                  },
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                        position: 'relative',
                        fontFamily: "'Cinzel', serif"
                      } 
                    }, 
                      rank === 1 ? '👑 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : rank
                    ),
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: rank <= 3 ? 'bold' : 'normal'
                      } 
                    }, 
                      // Validate username to prevent XSS
                      (player.username || '').replace(/[<>]/g, '')
                    ),
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
                      } 
                    }, 
                      React.createElement('span', {
                        style: {
                          display: 'inline-block',
                          width: '26px',
                          height: '26px',
                          lineHeight: '26px',
                          textAlign: 'center',
                          backgroundColor: 'rgba(100, 58, 113, 0.8)',
                          borderRadius: '50%',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
                        }
                      }, player.level || 1)
                    ),
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        textAlign: 'right',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#e5ac5c',
                        fontFamily: "'Cinzel', serif"
                      } 
                    }, formatNumber(player.experience || 0))
                  );
                })
              )
            ),
    
    // World Status section (shows only if data is available)
    worldStatus && React.createElement('div', {
      style: {
        marginTop: '30px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '20px'
      }
    },
      React.createElement('h3', {
        style: {
          color: 'white',
          margin: '0 0 15px 0',
          fontFamily: "'IM Fell French Canon', serif",
          fontSize: '1.5rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }
      }, 'World Status'),
      
      // World time info
      React.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px'
        }
      },
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center'
          }
        },
          React.createElement('i', {
            className: getWorldTimeDayCycle() === 'Night' ? 'fas fa-moon' : 'fas fa-sun',
            style: {
              marginRight: '10px',
              color: getWorldTimeDayCycle() === 'Night' ? '#a0c4ff' : '#ffd166',
              fontSize: '1.5rem'
            }
          }),
          React.createElement('div', null,
            React.createElement('div', {
              style: {
                fontFamily: "'Cinzel', serif",
                fontWeight: 'bold',
                color: 'white'
              }
            }, getWorldTimeDayCycle()),
            React.createElement('div', {
              style: {
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }, new Date(getGeneratedTimestamp()).toLocaleTimeString())
          )
        ),
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center'
          }
        },
          React.createElement('i', {
            className: getWeatherIcon(getWorldTimeWeather()),
            style: {
              marginRight: '10px',
              color: getWeatherColor(getWorldTimeWeather()),
              fontSize: '1.5rem'
            }
          }),
          React.createElement('div', {
            style: {
              fontFamily: "'Cinzel', serif",
              fontWeight: 'bold',
              color: 'white'
            }
          }, getWorldTimeWeather())
        )
      ),
      
      // Active players
      React.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '10px 0'
        }
      },
        React.createElement('div', {
          style: {
            fontFamily: "'IM Fell English', serif",
            color: 'rgba(255, 255, 255, 0.9)'
          }
        }, 'Active Adventurers:'),
        React.createElement('div', {
          style: {
            fontFamily: "'Cinzel', serif",
            fontWeight: 'bold',
            color: '#e5ac5c'
          }
        }, getActivePlayers())
      ),
      
      // World regions (if available)
      getRegions().length > 0 && React.createElement('div', {
        style: {
          margin: '15px 0'
        }
      },
        React.createElement('div', {
          style: {
            fontFamily: "'IM Fell English', serif",
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '10px'
          }
        }, 'Region Population:'),
        
        getRegions().map(region => 
          region.population > 0 && React.createElement('div', {
            key: region.region,
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              padding: '5px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }
          },
            React.createElement('div', {
              style: {
                fontSize: '0.9rem',
                color: 'white'
              }
            }, region.region),
            React.createElement('div', {
              style: {
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: '#e5ac5c'
              }
            }, region.population)
          )
        )
      )
    ),
    
    // Add CSS keyframes for animations
    React.createElement('style', null, `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `)
  );
  
  // Helper function to determine weather icon
  function getWeatherIcon(weather) {
    switch (weather) {
      case 'Cloudy': return 'fas fa-cloud';
      case 'Rainy': return 'fas fa-cloud-rain';
      case 'Stormy': return 'fas fa-bolt';
      case 'Foggy': return 'fas fa-smog';
      default: return 'fas fa-sun'; // Clear
    }
  }
  
  // Helper function to determine weather color
  function getWeatherColor(weather) {
    switch (weather) {
      case 'Cloudy': return '#a9b7c6';
      case 'Rainy': return '#81a4cd';
      case 'Stormy': return '#c9a5dc';
      case 'Foggy': return '#c2c2c2';
      default: return '#ffd166'; // Clear
    }
  }
};