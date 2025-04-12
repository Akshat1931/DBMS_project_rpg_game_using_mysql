// src/leaderboard-component.js

const LeaderboardComponent = () => {
    const [leaderboardData, setLeaderboardData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
  
    React.useEffect(() => {
      // Fetch leaderboard data when component mounts
      fetchLeaderboardData();
    }, []);
  
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        // Fetch all players and sort them by experience
        const response = await fetch('http://localhost:3000/api/players');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
  
        const players = await response.json();
        
        // Sort players by experience (highest first)
        const sortedPlayers = players.sort((a, b) => b.experience - a.experience);
        
        setLeaderboardData(sortedPlayers);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
    const handleRefresh = () => {
      setRefreshing(true);
      fetchLeaderboardData();
    };
  
    return React.createElement('div', { 
      className: 'leaderboard-container', 
      style: { 
        backgroundColor: 'rgba(1.0, 1.0, 1.0, 0.75)',
        padding: '20px',
        borderRadius: '10px',
        width: '100%',
        maxHeight: '400px',
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
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
                    const rank = index + 1;
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
                      }, player.username),
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
                      }, player.experience || 0)
                    );
                  })
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
  };