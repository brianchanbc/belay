import { useEffect } from 'react';

// Signup view
const Signup = ({ username, setUsername, password, setPassword, confirmPassword, setConfirmPassword, handleSignUp, handleMenuClick, errorMessage, setCurrentView }: {
  username: string,
  setUsername: (value: string) => void,
  password: string,
  setPassword: (value: string) => void,
  confirmPassword: string,
  setConfirmPassword: (value: string) => void,
  handleSignUp: () => void,
  handleMenuClick: (value: string) => void,
  errorMessage: string,
  setCurrentView: (value: string) => void
}) => {
  useEffect(() => {
    setCurrentView('/signup');
    document.title = "Belay - Signup";
  }, []);

  return (
    <div className="signup-container">
      <div className="signup-title">Sign Up</div>
      <form className='signup-form'>
        <label>
          <span>Username:</span>
          <input type="text" name="Username" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          <span>Password:</span>
          <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <label>
          <span>Re-enter Password:</span>
          <input type="password" name="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </label>
        <div className='all-signup-buttons'>
          <button className='signup-button' onClick={(event) => {
            event.preventDefault();
            handleSignUp(); 
          }}>Sign Up</button>
          <button className='login-signup-button' onClick={() => handleMenuClick('login')}>Login</button>
          <button className='cancel-signup-button' onClick={() => handleMenuClick('')}>Cancel</button>
        </div>
        {errorMessage && <p style={{ textAlign: 'center', color: 'yellow' }}>{errorMessage}</p>}
      </form>
    </div>
  )
}
  
export default Signup