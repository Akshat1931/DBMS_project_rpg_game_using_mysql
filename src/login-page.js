// LoginPage component with enhanced UI

const LoginPage = () => {
  const [username, setUsername] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [particles, setParticles] = React.useState([]);

  // Create floating particles on mount
  React.useEffect(() => {
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
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, fetch all players to simulate login
      const response = await fetch('http://localhost:3000/api/players');
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
      } else {
        setError({ type: 'error', message: 'Player not found' });
      }
    } catch (err) {
      setError({ type: 'error', message: 'Login failed. Please try again.' });
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const newPlayer = await response.json();

      if (newPlayer.id) {
        localStorage.setItem('playerId', newPlayer.id);
        
        // Show success briefly before redirect
        setError({ type: 'success', message: 'Account created successfully!' });
        
        // Redirect to game after a brief delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        setError({ type: 'error', message: 'Registration failed' });
      }
    } catch (err) {
      setError({ type: 'error', message: err.message || 'Registration failed. Please try again.' });
      console.error('Registration error:', err);
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
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          left: `${particle.left}%`,
          bottom: '-5px',
          opacity: particle.opacity,
          animation: `float ${particle.duration}s infinite linear`,
          animationDelay: `${particle.delay}s`,
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
                  onChange: (e) => setUsername(e.target.value),
                  placeholder: 'Enter your username',
                  required: true,
                  style: {
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.8rem 1rem 0.8rem 2.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    fontFamily: "'Crimson Text', serif",
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }
                })
              )
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
          
          // Footer text
          React.createElement('div', {
            style: {
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
            React.createElement('p', null, 'Enter the realm and claim your destiny!')
          )
        ),
        
        // Leaderboard component
        React.createElement(LeaderboardComponent)
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