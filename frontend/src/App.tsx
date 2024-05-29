import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from "react-router-dom"
import axios from 'axios';
import Landing from './components/Landing'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import Channel from './components/Channel'

import './App.css';

// Reference for routing: https://coderpad.io/blog/development/guide-to-react-router/

function App() {
  const tokenKey: string = 'brianchan_belay_auth_key';
  const [currentView, setCurrentView] = useState<string>('/');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const navigate = useNavigate();

  // Function to handle menu clicks
  const handleMenuClick = (view: string) => {
    if (view === 'Logout') {
      setCurrentView('/');
      navigate('/');
      return;
    }
    if (view === 'channel' && !loginStatus) {
      setCurrentView('/login');
      navigate('/login');
      return;
    }
    setCurrentView(`/${view}`);
    navigate(`/${view}`);
  };

  // Function to handle sign up
  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setPassword('');
      setConfirmPassword('');
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      'username': username,
      'password': password
    }
    axios.post('/api/signup', {}, {
      headers: headers,
    }).then((response) => {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      localStorage.setItem(tokenKey, response.data.apiKey);
      setLoginStatus(true);
      setCurrentView('/profile');
      setErrorMessage('');
      navigate('/profile');
    }).catch((error) => {
      setErrorMessage(error.response.data.error);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    });
  }

  // Function to handle login
  const handleLogin = () => {
    axios.get('/api/login', {
      headers: {
        username: username,
        password: password,
      }
    }).then((response) => {
      if (response.data.apiKey) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        localStorage.setItem(tokenKey, response.data.apiKey);
        setLoginStatus(true);
        setCurrentView('/profile');
        setErrorMessage('');
        navigate('/profile');
      }
    }).catch((error) => {
      setErrorMessage(error.response.data.error);
    });
  }

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem(tokenKey);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setLoginStatus(false);
    setCurrentView('/');
    navigate('/');
  }

  // Function to handle changing profile
  const handleChangeProfile = () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setPassword('');
      setConfirmPassword('');
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      newusername: username,
      newpassword: password,
      apikey: localStorage.getItem(tokenKey),
    }
    axios.put('/api/change_profile', {}, {
      headers: headers,
    }).then(() => {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      setConfirmPassword('');
      setErrorMessage('Profile changed successfully');
    }).catch((error) => {
      setErrorMessage(error.response.data.error);
      setUsername(localStorage.getItem("username") || ""); 
      setPassword(localStorage.getItem("password") || ""); 
      setConfirmPassword('');
    });
  }

  useEffect(() => {
    setErrorMessage('');
    // Check if user is already logged in. If so, set login status to true
    // and set username and password to the stored values
    const sessionToken = localStorage.getItem(tokenKey);
    if (sessionToken) {
      setLoginStatus(true);
      setUsername(localStorage.getItem("username") || ""); 
      setPassword(localStorage.getItem("password") || ""); 
      setConfirmPassword('');
    }
  }, [currentView]);

  return (
    <div className={'app-container'}>
      <div className="menu-bar">
        <div className="belay-logo" onClick={()=> {
          setCurrentView('/');
          navigate('/');
          document.title = "Belay";
        }}>Belay</div>
        {(currentView == '/' || currentView == '/profile' || currentView == '/channel') && (
          <div>
            <button onClick={() => handleMenuClick('channel')}>Channels</button>  
          </div>
        )}
        {currentView == '/' && !loginStatus && (
          <div>
            <button onClick={() => handleMenuClick('login')}>Login</button>
            <button onClick={() => handleMenuClick('signup')}>Sign Up</button>
          </div>
        )}
        {loginStatus && (
          <div>
            <button onClick={() => handleMenuClick('profile')}>Profile</button>
            <button onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}>Log Out</button>
          </div>
        )}
      </div>
      <Routes>
        <Route path="/" element={
          <Landing 
            setCurrentView={setCurrentView}
          /> 
        } />
        <Route path="/login" element={
          <Login 
            username={username} 
            setUsername={setUsername} 
            password={password} 
            setPassword={setPassword} 
            handleLogin={handleLogin} 
            handleMenuClick={handleMenuClick} 
            errorMessage={errorMessage} 
            setCurrentView={setCurrentView}
          />
        } />
        <Route path="/signup" element={
          <Signup 
            username={username} 
            setUsername={setUsername} 
            password={password} 
            setPassword={setPassword} 
            confirmPassword={confirmPassword} 
            setConfirmPassword={setConfirmPassword} 
            handleSignUp={handleSignUp} 
            handleMenuClick={handleMenuClick} 
            errorMessage={errorMessage} 
            setCurrentView={setCurrentView}
          />
        } />
        <Route path="/profile" element={
          localStorage.getItem(tokenKey) ? (
            <Profile 
              username={username} 
              setUsername={setUsername} 
              password={password} 
              setPassword={setPassword} 
              confirmPassword={confirmPassword} 
              setConfirmPassword={setConfirmPassword} 
              handleChangeProfile={handleChangeProfile} 
              handleMenuClick={handleMenuClick} 
              errorMessage={errorMessage} 
              setCurrentView={setCurrentView}
            />
          ) : (
            <Navigate replace to={"/login"} />
          )
        } />
        <Route path="/channel" element={
          localStorage.getItem(tokenKey) ? (
          <Channel 
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            username={username}
            tokenKey={tokenKey}
            currentView={currentView}
            setCurrentView={setCurrentView}
            focusView={'0'}
          />
          ) : (
            <Navigate replace to={"/login"} />
          )
        } />
        <Route path="/channel/:cid" element={
          localStorage.getItem(tokenKey) ? (
          <Channel 
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            username={username}
            tokenKey={tokenKey}
            currentView={currentView}
            setCurrentView={setCurrentView}
            focusView={'1'}
          />
          ) : (
            <Navigate replace to={"/login"} />
          )
        } />
        <Route path="/channel/:cid/:tid" element={
          localStorage.getItem(tokenKey) ? (
          <Channel 
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            username={username}
            tokenKey={tokenKey}
            currentView={currentView}
            setCurrentView={setCurrentView}
            focusView={'2'}
          />
          ) : (
            <Navigate replace to={"/login"} />
          )
        } />
        <Route path="*" element={
          localStorage.getItem(tokenKey) ? 
          <Navigate to="/" /> : 
          <Navigate to="/login" />
        } />
      </Routes>
    </div>
  );
}

export default App
