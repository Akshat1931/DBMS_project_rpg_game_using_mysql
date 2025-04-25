// src/login-page.js - Complete version without errors

// Define a simple leaderboard component directly in this file
// to avoid reference errors
const SimpleLeaderboardComponent = () => {
  const [leaderboardData, setLeaderboardData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Fetch leaderboard data when component mounts
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      try {
        const response = await fetch('http://localhost:3000/api/players');
        if (response.ok) {
          const players = await response.json();
          // Sort players by experience (highest first)
          const sortedPlayers = players.sort((a, b) => b.experience - a.experience);
          setLeaderboardData(sortedPlayers);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('API not available, using fallback data');
      }

      // Fallback to some default data if API is not available
      setLeaderboardData([
        { id: 1, username: 'Hero123', level: 10, experience: 5000 },
        { id: 2, username: 'Warrior456', level: 8, experience: 3200 },
        { id: 3, username: 'Mage789', level: 7, experience: 2800 },
        { id: 4, username: 'Archer222', level: 5, experience: 1500 },
        { id: 5, username: 'Knight333', level: 4, experience: 1000 }
      ]);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    // Header
    React.createElement('h3', { 
      style: { 
        color: 'white',
        margin: '0 0 15px 0',
        fontFamily: "'IM Fell French Canon', serif",
        fontSize: '1.8rem',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
      }
    }, 'Top Adventurers'),
    
    loading 
      ? React.createElement('div', { 
          style: { 
            textAlign: 'center', 
            padding: '40px 0',
            color: 'white' 
          } 
        }, 'Loading adventurers...')
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
                leaderboardData.slice(0, 5).map((player, index) => {
                  const rank = index + 1;
                  return React.createElement('tr', { 
                    key: player.id || index,
                    style: { 
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                    }
                  },
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold'
                      } 
                    }, 
                      rank === 1 ? '👑 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : rank
                    ),
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      } 
                    }, 
                      player.username || 'Unknown'
                    ),
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
                      } 
                    }, 
                      player.level || 1
                    ),
                    React.createElement('td', { 
                      style: { 
                        padding: '10px', 
                        textAlign: 'right',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#e5ac5c'
                      } 
                    }, formatNumber(player.experience || 0))
                  );
                })
              )
            )
  );
};

// Main LoginPage component
const LoginPage = () => {
  const [username, setUsername] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [particles, setParticles] = React.useState([]);
  const [formErrors, setFormErrors] = React.useState({});

  // Create floating particles on mount
  React.useEffect(() => {
    try {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          size: Math.random() * 4 + 2,
          left: Math.random() * 100,
          delay: Math.random() * 15,
          duration: Math.random() * 10 + 10,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
      setParticles(newParticles);
    } catch (err) {
      console.error('Error creating particles:', err);
      // Continue without particles if there's an error
    }
  }, []);

  // Validate username
  const validateUsername = (username) => {
    let errors = {};

    if (!username || username.trim() === '') {
      errors.username = 'Username is required';
      return errors;
    }

    if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      return errors;
    }

    if (username.length > 20) {
      errors.username = 'Username cannot exceed 20 characters';
      return errors;
    }

    // Allow only alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      errors.username = 'Username may only contain letters, numbers, and underscores';
      return errors;
    }

    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate username
    const errors = validateUsername(username);
    setFormErrors(errors);
    
    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Try to use the API first
      try {
        const response = await fetch('http://localhost:3000/api/players');
        
        if (response.ok) {
          const players = await response.json();
          // Simple username-based authentication
          const player = players.find(p => p.username === username);

          if (player) {
            // Store player ID in localStorage for game to use
            localStorage.setItem('playerId', player.id);
            
            // Show success briefly before redirect
            setError({ type: 'success', message: 'Login successful!' });
            
            // Redirect to game after a brief delay
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1000);
            return;
          } else {
            setError({ type: 'error', message: 'Player not found. Please register first.' });
          }
        }
      } catch (apiError) {
        console.warn('API not available, using direct localStorage');
      }

      // Fallback to localStorage if API is not available
      // This is just to ensure the game can be played offline
      localStorage.setItem('playerId', Date.now().toString());
      setError({ type: 'success', message: 'Login successful (offline mode)!' });
      
      // Redirect to game after a brief delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError({ 
        type: 'error', 
        message: 'Login failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate username
    const errors = validateUsername(username);
    setFormErrors(errors);
    
    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Try API first
      try {
        const response = await fetch('http://localhost:3000/api/player', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username,
            // Default initial stats
            health: 100,
            strength: 50,
            wisdomness: 5,
            benchpress: 20,
            curl: 100,
            experience: 0,
            level: 1
          })
        });

        if (response.ok) {
          const newPlayer = await response.json();

          if (newPlayer.id) {
            localStorage.setItem('playerId', newPlayer.id);
            
            // Show success briefly before redirect
            setError({ type: 'success', message: 'Account created successfully!' });
            
            // Redirect to game after a brief delay
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1000);
            return;
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Registration failed');
        }
      } catch (apiError) {
        console.warn('API not available, using localStorage fallback');
      }

      // Fallback if API is not available
      const playerId = Date.now().toString();
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('username', username);
      
      // Show success briefly before redirect
      setError({ type: 'success', message: 'Account created successfully (offline mode)!' });
      
      // Redirect to game after a brief delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message && err.message.includes('Username already exists')) {
        setError({ type: 'error', message: 'Username already taken. Please choose another.' });
      } else {
        setError({ type: 'error', message: err.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Particle background component
  const ParticleBackground = () => {
    return React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1
      }
    },
    particles.map(particle => 
      React.createElement('div', {
        key: particle.id,
        style: {
          position: 'absolute',
          width: particle.size + 'px',
          height: particle.size + 'px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          left: particle.left + '%',
          bottom: '-5px',
          opacity: particle.opacity,
          animation: 'float ' + particle.duration + 's infinite linear',
          animationDelay: particle.delay + 's',
        }
      })
    ),
    React.createElement('style', null, `
      @keyframes float {
        0% {
          transform: translateY(0) translateX(0) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 0.8;
        }
        90% {
          opacity: 0.6;
        }
        100% {
          transform: translateY(-100vh) translateX(100px) rotate(360deg);
          opacity: 0;
        }
      }
    `)
    );
  };

  // Main container
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#000',
      backgroundImage: 'url("https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjAxN3wwfDF8c2VhcmNofDIxfHxmYW50YXN5JTIwZm9yZXN0fGVufDB8fHx8MTcxMzA0ODE5OXww&ixlib=rb-4.0.3&q=80&w=1080")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: "'IM Fell French Canon', serif",
      position: 'relative',
      overflow: 'hidden'
    }
  },
    // Particle background
    React.createElement(ParticleBackground),
    
    // Dark overlay
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.85) 0%, rgba(20, 20, 20, 0.7) 100%)',
        zIndex: 0
      }
    }),
    
    // Main content container
    React.createElement('div', {
      style: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
        flex: 1
      }
    },
      // Header
      React.createElement('header', {
        style: {
          textAlign: 'center',
          marginBottom: '2rem'
        }
      },
        React.createElement('h1', {
          style: {
            fontFamily: "'Cinzel', serif",
            fontSize: '4rem',
            fontWeight: '800',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(154, 109, 177, 0.5)',
            marginBottom: '0.5rem',
            animation: 'glow 3s infinite alternate'
          }
        }, 'Fantasy Protocol'),
        React.createElement('p', {
          style: {
            fontFamily: "'IM Fell English', serif",
            fontStyle: 'italic',
            fontSize: '1.5rem',
            color: '#e5ac5c',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }
        }, 'Embark on a legendary journey in a realm of magic and adventure'),
        React.createElement('style', null, `
          @keyframes glow {
            0% {
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(154, 109, 177, 0.5);
            }
            100% {
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(154, 109, 177, 0.8);
            }
          }
        `)
      ),
      
      // Main content (login + leaderboard side by side)
      React.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }
      },
        // Login/Register panel
        React.createElement('div', {
          style: {
            backgroundColor: 'rgba(20, 20, 20, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '2rem',
            width: '100%',
            maxWidth: '400px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.5s ease-in forwards',
            opacity: 0
          }
        },
          // Tab switcher
          React.createElement('div', {
            style: {
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }
          },
            React.createElement('button', {
              onClick: () => setIsRegistering(false),
              style: {
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                fontFamily: "'IM Fell English', serif",
                fontSize: '1rem',
                cursor: 'pointer',
                position: 'relative',
                opacity: isRegistering ? 0.7 : 1,
                transition: 'opacity 0.3s'
              }
            }, 'Login'),
            React.createElement('button', {
              onClick: () => setIsRegistering(true),
              style: {
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                fontFamily: "'IM Fell English', serif",
                fontSize: '1rem',
                cursor: 'pointer',
                position: 'relative',
                opacity: isRegistering ? 1 : 0.7,
                transition: 'opacity 0.3s'
              }
            }, 'Register')
          ),
          
          // Title (changes based on tab)
          React.createElement('h2', {
            style: {
              fontFamily: "'Cinzel', serif",
              fontSize: '1.8rem',
              color: '#e5ac5c',
              marginBottom: '1.5rem',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }
          }, isRegistering ? 'Join the Adventure' : 'Welcome Back'),
          
          // Login/Register form
          React.createElement('form', {
            onSubmit: isRegistering ? handleRegister : handleLogin
          },
            // Username field
            React.createElement('div', {
              style: {
                marginBottom: '1.2rem',
                position: 'relative'
              }
            },
              React.createElement('label', {
                htmlFor: 'username',
                style: {
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'white',
                  fontFamily: "'IM Fell English', serif"
                }
              }, 'Username'),
              React.createElement('div', {
                style: {
                  position: 'relative'
                }
              },
                React.createElement('i', {
                  className: 'fas fa-user',
                  style: {
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#e5ac5c',
                    opacity: 0.8
                  }
                }),
                React.createElement('input', {
                  type: 'text',
                  id: 'username',
                  value: username,
                  onChange: (e) => {
                    setUsername(e.target.value);
                    // Clear validation errors when typing
                    if (formErrors.username) {
                      setFormErrors({...formErrors, username: null});
                    }
                  },
                  placeholder: 'Enter your username',
                  required: true,
                  style: {
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.8rem 1rem 0.8rem 2.5rem',
                    border: formErrors.username 
                      ? '1px solid #f44336' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    fontFamily: "'Crimson Text', serif",
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }
                })
              ),
              // Username validation error
              formErrors.username && React.createElement('div', {
                style: {
                  color: '#f44336',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                  fontFamily: "'Crimson Text', serif"
                }
              }, formErrors.username)
            ),
            
            // Error or success message
            error && React.createElement('div', {
              style: {
                color: error.type === 'success' ? '#4caf50' : '#f44336',
                padding: '0.5rem',
                marginBottom: '1rem',
                borderRadius: '4px',
                backgroundColor: error.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                textAlign: 'center',
                animation: 'fadeIn 0.3s'
              }
            }, error.message),
            
            // Submit button
            React.createElement('button', {
              type: 'submit',
              disabled: loading,
              style: {
                width: '100%',
                padding: '0.8rem',
                border: 'none',
                borderRadius: '5px',
                fontFamily: "'Cinzel', serif",
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: error && error.type === 'success' ? '#4caf50' : '#643a71',
                backgroundImage: error && error.type === 'success' ? 'linear-gradient(135deg, #4caf50, #388e3c)' : 'linear-gradient(135deg, #643a71, #4a2a54)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(100, 58, 113, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }
            },
              loading && React.createElement('span', {
                style: {
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  borderTopColor: 'white',
                  animation: 'spin 1s linear infinite'
                }
              }),
              error && error.type === 'success' 
                ? React.createElement('span', null, '✓ ' + error.message) 
                : React.createElement('span', null, isRegistering ? 'Create Account' : 'Login')
            )
          ),
          
          // Footer text with validation info
          React.createElement('div', {
            style: {
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
            React.createElement('p', null, 'Enter the realm and claim your destiny!'),
            React.createElement('p', {
              style: {
                fontSize: '0.8rem',
                marginTop: '0.5rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }, 'Username must be 3-20 characters using only letters, numbers, and underscores.')
          )
        ),
        
        // Use SimpleLeaderboardComponent (defined at the top of this file)
        React.createElement(SimpleLeaderboardComponent)
      ),
      
      // Footer
      React.createElement('footer', {
        style: {
          textAlign: 'center',
          marginTop: '3rem',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem'
        }
      },
        React.createElement('div', {
          style: {
            width: '200px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e5ac5c, transparent)',
            margin: '0 auto 1rem'
          }
        }),
        React.createElement('p', null, '© 2025 Fantasy Protocol | The ultimate fantasy adventure awaits')
      )
    ),
    
    // Add keyframes styling
    React.createElement('style', null, `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `)
  );
};