import { useEffect } from 'react';

// Profile view
const Profile = ({ username, setUsername, password, setPassword, confirmPassword, setConfirmPassword, handleChangeProfile, handleMenuClick, errorMessage, setCurrentView }: {
  username: string,
  setUsername: (username: string) => void,
  password: string,
  setPassword: (password: string) => void,
  confirmPassword: string,
  setConfirmPassword: (confirmPassword: string) => void,
  handleChangeProfile: () => void,
  handleMenuClick: (arg: string) => void,
  errorMessage: string,
  setCurrentView: (view: string) => void
}) => {
  useEffect(() => {
    setCurrentView('/profile');
    document.title = "Belay - Profile";
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-title">Profile</div>
      <form className='profile-form'>
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
      </form>
      <div className="all-profile-buttons">
        <button className='edit-profile-button' onClick={(event) => {
          event.preventDefault();
          handleChangeProfile();
        }}>Edit Profile</button>
        <button className='cancel-profile-button' onClick={() => handleMenuClick('')}>Cancel</button>
      </div>
      {errorMessage && <p style={{ textAlign: 'center', color: 'yellow' }}>{errorMessage}</p>}
    </div>
  )
}
  
export default Profile