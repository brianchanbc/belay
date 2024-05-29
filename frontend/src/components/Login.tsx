import { useEffect } from 'react';

// Login view
const Login = ({ username, setUsername, password, setPassword, handleLogin, handleMenuClick, errorMessage, setCurrentView }: { 
  username: string; 
  setUsername: (value: string) => void; 
  password: string; 
  setPassword: (value: string) => void; 
  handleLogin: () => void; 
  handleMenuClick: (value: string) => void; 
  errorMessage: string; 
  setCurrentView: (value: string) => void; 
}) => {
  useEffect(() => {
    setCurrentView('/login');
    document.title = "Belay - Login";
  }, []);

  return (
    <div className="login-container">
      <div className="login-title">Login</div>
      <form className='login-form'>
        <label>
          <span>Username:</span>
          <input type="text" name="Username" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          <span>Password:</span>
          <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <div className='all-login-buttons'>
          <button className='login-button' onClick={(event) => {
            event.preventDefault();
            handleLogin();
          }}>Login</button>
          <button className='signup-login-button' onClick={() => handleMenuClick('signup')}>Sign Up</button>
          <button className='cancel-login-button' onClick={() => handleMenuClick('')}>Cancel</button>
        </div>
        {errorMessage && <p style={{ textAlign: 'center', color: 'yellow' }}>{errorMessage}</p>}
      </form>
    </div>
    )
}
  
export default Login