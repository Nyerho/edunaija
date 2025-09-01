import React, { useState, useEffect, useCallback } from 'react';
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

// Library Page Content Component
function LibraryPageContent({ resources, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, selectedTags, setSelectedTags, sortBy, setSortBy, availableTags, handleTagToggle, clearFilters }) {
  const handleResourceClick = async (resource) => {
    try {
      await updateResourceStats(resource.id, 'view');
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleDownload = async (resource) => {
    try {
      await updateResourceStats(resource.id, 'download');
      window.open(resource.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  return (
    <div className="library-page">
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="textbook">Textbooks</option>
            <option value="notes">Notes</option>
            <option value="past-questions">Past Questions</option>
            <option value="research">Research Papers</option>
            <option value="tutorial">Tutorials</option>
            <option value="other">Other</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="mostDownloaded">Most Downloaded</option>
            <option value="alphabetical">A-Z</option>
          </select>
          
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
        
        {availableTags.length > 0 && (
          <div className="tag-filters">
            <h4>Filter by Tags:</h4>
            <div className="tag-list">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="resources-grid">
        {resources.map(resource => (
          <div key={resource.id} className="resource-card" onClick={() => handleResourceClick(resource)}>
            <h3>{resource.title}</h3>
            <p className="resource-description">{resource.description}</p>
            <div className="resource-meta">
              <span className="category">{resource.category}</span>
              <div className="stats">
                <span>👁 {resource.views || 0}</span>
                <span>⬇ {resource.downloads || 0}</span>
              </div>
            </div>
            {resource.tags && resource.tags.length > 0 && (
              <div className="resource-tags">
                {resource.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(resource);
              }}
              className="download-btn"
            >
              Download
            </button>
          </div>
        ))}
      </div>
      
      {resources.length === 0 && (
        <div className="no-resources">
          <p>No resources found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

// Library Page Component
function LibraryPage() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterAndSortResources = useCallback(() => {
    let filtered = resources;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.tags && resource.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(resource =>
        resource.tags && selectedTags.every(tag => resource.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'mostViewed':
          return (b.views || 0) - (a.views || 0);
        case 'mostDownloaded':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedTags, sortBy]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const resourcesData = await getResources();
      setResources(resourcesData);
      
      // Extract unique tags
      const tags = new Set();
      resourcesData.forEach(resource => {
        if (resource.tags) {
          resource.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterAndSortResources();
  }, [filterAndSortResources]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSortBy('newest');
  };

  if (loading) {
    return <div className="loading">Loading resources...</div>;
  }

  return (
    <LibraryPageContent 
      resources={filteredResources}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      sortBy={sortBy}
      setSortBy={setSortBy}
      availableTags={availableTags}
      handleTagToggle={handleTagToggle}
      clearFilters={clearFilters}
    />
  );
}

// Upload Page Component
function UploadPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'textbook',
    tags: '',
    downloadUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      if (!user) {
        navigate('/login');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      setError('');
      
      const resourceData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString(),
        views: 0,
        downloads: 0,
        uploadedBy: user.uid,
        uploaderName: user.displayName || user.email
      };
      
      await addResource(resourceData);
      setFormData({
        title: '',
        description: '',
        category: 'textbook',
        tags: '',
        downloadUrl: ''
      });
      alert('Resource uploaded successfully!');
      navigate('/library');
    } catch (error) {
      setError('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="upload-page">
      <h2>Add New Resource</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Category:</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="textbook">Textbook</option>
            <option value="notes">Notes</option>
            <option value="past-questions">Past Questions</option>
            <option value="research">Research Paper</option>
            <option value="tutorial">Tutorial</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Tags (comma-separated):</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="e.g., mathematics, calculus, university"
          />
        </div>
        
        <div className="form-group">
          <label>Download URL:</label>
          <input
            type="url"
            value={formData.downloadUrl}
            onChange={(e) => setFormData({...formData, downloadUrl: e.target.value})}
            required
            placeholder="https://..."
          />
        </div>
        
        <button type="submit" disabled={uploading} className="submit-button">
          {uploading ? 'Uploading...' : 'Add Resource'}
        </button>
      </form>
    </div>
  );
}

// Login Page Component
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError('Google sign-up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

// Main App Component
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    document.title = 'EduNaija - Nigerian Educational Resources';
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <div className="nav-container">
        <nav className="nav">
          <div className="logo">
            <Link to="/">EduNaija 🇳🇬</Link>
          </div>
          <div className="nav-buttons">
            <Link to="/" className="nav-button">Home</Link>
            <Link to="/library" className="nav-button">Library</Link>
            {user ? (
              <>
                <Link to="/upload" className="nav-button">Upload</Link>
                <span className="user-info">Welcome, {user.displayName || user.email}</span>
                <button onClick={handleLogout} className="nav-button logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-button">Login</Link>
                <Link to="/register" className="nav-button">Register</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route 
            path="/upload" 
            element={user ? <UploadPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <RegisterPage /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
