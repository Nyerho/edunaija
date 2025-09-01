import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { 
  addResource, 
  getResources, 
  searchResources, 
  updateResourceStats,
  registerUser, 
  loginUser, 
  signInWithGoogle,
  logoutUser, 
  onAuthChange 
} from './services/database';

// Main App Component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// App Content Component
function AppContent() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);

  // Update page title based on current route
  useEffect(() => {
    const path = window.location.pathname;
    let title = 'EduNaija - Nigerian Educational Resources';
    
    switch (path) {
      case '/library':
        title = 'Library - EduNaija';
        break;
      case '/upload':
        title = 'Add Resource - EduNaija';
        break;
      case '/login':
        title = 'Login - EduNaija';
        break;
      case '/register':
        title = 'Register - EduNaija';
        break;
      default:
        title = 'EduNaija - Nigerian Educational Resources';
    }
    
    document.title = title;
  }, [window.location.pathname]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const resourcesData = await getResources();
      setResources(resourcesData);
    } catch (error) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchResources(searchTerm, selectedCategory);
      setResources(results);
    } catch (error) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = async (resourceId) => {
    try {
      await updateResourceStats(resourceId, 'views');
      setResources(prev => prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, views: (resource.views || 0) + 1 }
          : resource
      ));
    } catch (error) {
      console.error('Failed to update views:', error);
    }
  };

  const handleDownload = async (resourceId, downloadUrl) => {
    try {
      await updateResourceStats(resourceId, 'downloads');
      setResources(prev => prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, downloads: (resource.downloads || 0) + 1 }
          : resource
      ));
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to update downloads:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError('Google sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <h1>🎓 EduNaija</h1>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/library" className="nav-link">Library</Link>
        {user ? (
          <>
            <Link to="/upload" className="nav-link">Add Resource</Link>
            <button onClick={handleLogout} className="nav-button">
              Logout ({user.displayName || user.email})
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <div className="App">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/upload" element={user ? <UploadPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );

  // Home Page Component
  function HomePage() {
    return (
      <div className="home-page">
        <div className="hero-section">
          <h1>Welcome to EduNaija 🇳🇬</h1>
          <p>Your gateway to quality Nigerian educational resources</p>
          <Link to="/library" className="cta-button">
            Explore Resources
          </Link>
        </div>
        
        <div className="features-section">
          <div className="feature-card">
            <h3>📚 Comprehensive Library</h3>
            <p>Access a wide range of educational materials</p>
          </div>
          <div className="feature-card">
            <h3>🔍 Smart Search</h3>
            <p>Find exactly what you need with our search tools</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Community Driven</h3>
            <p>Resources shared by educators for educators</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced search and filter function
  const filterAndSortResources = useCallback(() => {
    let filtered = resources;

    // Filter by search term (title, description, tags)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        (resource.tags && resource.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(resource => 
        resource.tags && selectedTags.every(tag => 
          resource.tags.some(resourceTag => 
            resourceTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Sort resources
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostViewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'mostDownloaded':
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedTags, sortBy]);

  // Update filtered resources when filters change
  useEffect(() => {
    filterAndSortResources();
  }, [filterAndSortResources]);

  // Get all unique tags from resources
  const getAllTags = useCallback(() => {
    const allTags = resources.reduce((tags, resource) => {
      if (resource.tags) {
        resource.tags.forEach(tag => {
          if (!tags.includes(tag.toLowerCase())) {
            tags.push(tag.toLowerCase());
          }
        });
      }
      return tags;
    }, []);
    return allTags.sort();
  }, [resources]);

  // Handle tag selection
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setSortBy('newest');
  };

  // Upload Page Component
  function UploadPage() {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'mathematics',
      downloadUrl: '',
      tags: ''
    });
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
        setError('Please login to add resources');
        return;
      }

      try {
        setUploading(true);
        setError('');
        
        const resourceData = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          authorId: user.uid,
          authorEmail: user.email,
          authorName: user.displayName || user.email
        };
        
        await addResource(resourceData);
        
        setFormData({
          title: '',
          description: '',
          category: 'mathematics',
          downloadUrl: '',
          tags: ''
        });
        
        alert('Resource added successfully!');
        loadResources();
      } catch (error) {
        setError('Failed to add resource: ' + error.message);
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="upload-page">
        <h2>Add Educational Resource</h2>
        <p className="note">Share links to educational resources (Google Drive, Dropbox, etc.)</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <input
            type="text"
            placeholder="Resource Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
          
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="mathematics">Mathematics</option>
            <option value="english">English</option>
            <option value="science">Science</option>
            <option value="social-studies">Social Studies</option>
            <option value="vocational">Vocational</option>
          </select>
          
          <input
            type="url"
            placeholder="Download URL (Google Drive, Dropbox, etc.)"
            value={formData.downloadUrl}
            onChange={(e) => setFormData({...formData, downloadUrl: e.target.value})}
            required
          />
          
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
          />
          
          <button type="submit" disabled={uploading}>
            {uploading ? 'Adding Resource...' : 'Add Resource'}
          </button>
        </form>
      </div>
    );
  }

  // Library Page Component
  function LibraryPage() {
    const availableTags = getAllTags();
    const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedTags.length > 0;

    return (
      <div className="library-page">
        <h2>Educational Resources Library</h2>
        
        {/* Search Bar */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search resources by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          {/* Category Filter */}
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              <option value="mathematics">Mathematics</option>
              <option value="english">English</option>
              <option value="science">Science</option>
              <option value="social-studies">Social Studies</option>
              <option value="vocational">Vocational</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostViewed">Most Viewed</option>
              <option value="mostDownloaded">Most Downloaded</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div className="tags-section">
            <label>Filter by tags:</label>
            <div className="tags-container">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-btn ${
                    selectedTags.includes(tag) ? 'tag-selected' : ''
                  }`}
                >
                  {tag}
                  {selectedTags.includes(tag) && ' ✕'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="results-summary">
          <p>
            Showing {filteredResources.length} of {resources.length} resources
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        {/* Loading State */}
        {loading && <div className="loading">Loading resources...</div>}
        
        {/* Error State */}
        {error && <div className="error">{error}</div>}
        
        {/* No Results */}
        {!loading && filteredResources.length === 0 && resources.length > 0 && (
          <div className="no-results">
            <p>No resources found matching your criteria.</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && resources.length === 0 && (
          <div className="empty-state">
            <p>No resources available yet. Be the first to add one!</p>
            {user && (
              <button onClick={() => navigate('/upload')} className="cta-btn">
                Add Resource
              </button>
            )}
          </div>
        )}

        {/* Resources Grid */}
        <div className="resources-grid">
          {filteredResources.map(resource => (
            <div 
              key={resource.id} 
              className="resource-card"
              onClick={() => handleResourceClick(resource.id)}
            >
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <div className="resource-meta">
                <span className="category">{resource.category}</span>
                <span className="stats">
                  👁️ {resource.views || 0} | ⬇️ {resource.downloads || 0}
                </span>
              </div>
              {resource.tags && resource.tags.length > 0 && (
                <div className="resource-tags">
                  {resource.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="resource-tag">{tag}</span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="resource-tag">+{resource.tags.length - 3} more</span>
                  )}
                </div>
              )}
              {resource.downloadUrl && (
                <button 
                  className="download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(resource.id, resource.downloadUrl);
                  }}
                >
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Login Page Component
  function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        setLoggingIn(true);
        setError('');
        await loginUser(email, password);
        navigate('/');
      } catch (error) {
        setError('Login failed: ' + error.message);
      } finally {
        setLoggingIn(false);
      }
    };

    return (
      <div className="auth-page">
        <h2>Login to EduNaija</h2>
        {error && <div className="error">{error}</div>}
        
        <button 
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <span className="google-icon">🔍</span>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loggingIn}>
            {loggingIn ? 'Logging in...' : 'Login with Email'}
          </button>
        </form>
        
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    );
  }

  // Register Page Component
  function RegisterPage() {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    });
    const [registering, setRegistering] = useState(false);

    const handleRegister = async (e) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        setRegistering(true);
        setError('');
        await registerUser(formData.email, formData.password, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          authProvider: 'email'
        });
        navigate('/');
      } catch (error) {
        setError('Registration failed: ' + error.message);
      } finally {
        setRegistering(false);
      }
    };

    return (
      <div className="auth-page">
        <h2>Join EduNaija</h2>
        {error && <div className="error">{error}</div>}
        
        <button 
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <span className="google-icon">🔍</span>
          {loading ? 'Signing up...' : 'Sign up with Google'}
        </button>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
          <button type="submit" disabled={registering}>
            {registering ? 'Creating Account...' : 'Register with Email'}
          </button>
        </form>
        
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    );
  }
}

export default App;
