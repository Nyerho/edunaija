import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a472a',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#ffffff'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '1rem',
    listStyle: 'none',
    margin: 0,
    padding: 0
  };

  const navButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  };

  const activeNavButtonStyle = {
    ...navButtonStyle,
    backgroundColor: '#2d5a3d'
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage />;
      case 'library':
        return <LibraryPage />;
      case 'upload':
        return <UploadPage />;
      case 'login':
        return <LoginPage setUser={setUser} setCurrentPage={setCurrentPage} />;
      case 'register':
        return <RegisterPage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <nav style={navStyle}>
        <div style={logoStyle}>EduNaija</div>
        <ul style={navLinksStyle}>
          <li>
            <button 
              style={currentPage === 'home' ? activeNavButtonStyle : navButtonStyle}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button 
              style={currentPage === 'library' ? activeNavButtonStyle : navButtonStyle}
              onClick={() => setCurrentPage('library')}
            >
              Library
            </button>
          </li>
          <li>
            <button 
              style={currentPage === 'upload' ? activeNavButtonStyle : navButtonStyle}
              onClick={() => setCurrentPage('upload')}
            >
              Upload
            </button>
          </li>
          {!user ? (
            <>
              <li>
                <button 
                  style={currentPage === 'login' ? activeNavButtonStyle : navButtonStyle}
                  onClick={() => setCurrentPage('login')}
                >
                  Login
                </button>
              </li>
              <li>
                <button 
                  style={currentPage === 'register' ? activeNavButtonStyle : navButtonStyle}
                  onClick={() => setCurrentPage('register')}
                >
                  Register
                </button>
              </li>
            </>
          ) : (
            <li>
              <button 
                style={navButtonStyle}
                onClick={() => {
                  setUser(null);
                  setCurrentPage('home');
                }}
              >
                Logout ({user.name})
              </button>
            </li>
          )}
        </ul>
      </nav>
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

// HomePage Component
function HomePage() {
  const containerStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const heroStyle = {
    textAlign: 'center',
    padding: '3rem 0',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '3rem',
    color: '#1a472a',
    marginBottom: '1rem'
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem'
  };

  const featuresStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };

  const featureCardStyle = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1 style={titleStyle}>Welcome to EduNaija</h1>
        <p style={subtitleStyle}>
          Your premier destination for Nigerian educational resources
        </p>
        <p>Discover, share, and access quality educational materials from across Nigeria</p>
      </div>
      
      <div style={featuresStyle}>
        <div style={featureCardStyle}>
          <h3 style={{color: '#1a472a'}}>📚 Extensive Library</h3>
          <p>Access thousands of educational resources covering all subjects and levels</p>
        </div>
        <div style={featureCardStyle}>
          <h3 style={{color: '#1a472a'}}>🎓 Quality Content</h3>
          <p>All materials are reviewed and curated by educational professionals</p>
        </div>
        <div style={featureCardStyle}>
          <h3 style={{color: '#1a472a'}}>🤝 Community Driven</h3>
          <p>Join a community of educators and learners sharing knowledge</p>
        </div>
      </div>
    </div>
  );
}

// LibraryPage Component
function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const containerStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const searchStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  };

  const inputStyle = {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const selectStyle = {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const resourcesStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  };

  const resourceCardStyle = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #eee'
  };

  const sampleResources = [
    { id: 1, title: 'Mathematics for JSS1', category: 'Mathematics', author: 'Dr. Adebayo', downloads: 1250 },
    { id: 2, title: 'English Language Basics', category: 'English', author: 'Prof. Okafor', downloads: 980 },
    { id: 3, title: 'Nigerian History', category: 'History', author: 'Dr. Emeka', downloads: 750 },
    { id: 4, title: 'Basic Science Experiments', category: 'Science', author: 'Mrs. Fatima', downloads: 1100 }
  ];

  return (
    <div style={containerStyle}>
      <h1 style={{color: '#1a472a', marginBottom: '2rem'}}>Educational Library</h1>
      
      <div style={searchStyle}>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Categories</option>
          <option value="Mathematics">Mathematics</option>
          <option value="English">English</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
        </select>
      </div>

      <div style={resourcesStyle}>
        {sampleResources.map(resource => (
          <div key={resource.id} style={resourceCardStyle}>
            <h3 style={{color: '#1a472a', marginBottom: '0.5rem'}}>{resource.title}</h3>
            <p style={{color: '#666', marginBottom: '0.5rem'}}>Category: {resource.category}</p>
            <p style={{color: '#666', marginBottom: '0.5rem'}}>Author: {resource.author}</p>
            <p style={{color: '#666', marginBottom: '1rem'}}>Downloads: {resource.downloads}</p>
            <button style={{
              backgroundColor: '#1a472a',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// UploadPage Component
function UploadPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const containerStyle = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const formStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical'
  };

  const buttonStyle = {
    backgroundColor: '#1a472a',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{color: '#1a472a', marginBottom: '2rem'}}>Upload Educational Resource</h1>
      
      <form style={formStyle}>
        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="Enter resource title"
          />
        </div>

        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Category</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
          </select>
        </div>

        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={textareaStyle}
            placeholder="Describe your educational resource"
          />
        </div>

        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>File</label>
          <input
            type="file"
            style={inputStyle}
            accept=".pdf,.doc,.docx,.ppt,.pptx"
          />
        </div>

        <button type="submit" style={buttonStyle}>
          Upload Resource
        </button>
      </form>
    </div>
  );
}

// LoginPage Component
function LoginPage({ setUser, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const containerStyle = {
    padding: '2rem',
    maxWidth: '400px',
    margin: '2rem auto'
  };

  const formStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#1a472a',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    setUser({ name: 'John Doe', email });
    setCurrentPage('home');
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{color: '#1a472a', textAlign: 'center', marginBottom: '2rem'}}>Login to EduNaija</h2>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        
        <button type="submit" style={buttonStyle}>
          Login
        </button>
        
        <p style={{textAlign: 'center', marginTop: '1rem'}}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setCurrentPage('register')}
            style={{background: 'none', border: 'none', color: '#1a472a', cursor: 'pointer', textDecoration: 'underline'}}
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  );
}

// RegisterPage Component
function RegisterPage({ setCurrentPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const containerStyle = {
    padding: '2rem',
    maxWidth: '400px',
    margin: '2rem auto'
  };

  const formStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#1a472a',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Simulate registration
    alert('Registration successful! Please login.');
    setCurrentPage('login');
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{color: '#1a472a', textAlign: 'center', marginBottom: '2rem'}}>Register for EduNaija</h2>
        
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
          required
        />
        
        <button type="submit" style={buttonStyle}>
          Register
        </button>
        
        <p style={{textAlign: 'center', marginTop: '1rem'}}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setCurrentPage('login')}
            style={{background: 'none', border: 'none', color: '#1a472a', cursor: 'pointer', textDecoration: 'underline'}}
          >
            Login here
          </button>
        </p>
      </form>
    </div>
  );
}

export default App;
