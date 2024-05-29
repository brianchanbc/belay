
// Form to create a new channel
const CreateChannelForm = ({ newChannelName, setNewChannelName, handleCreateChannel }: 
  { newChannelName: string, setNewChannelName: (value: string) => void, handleCreateChannel: React.MouseEventHandler<HTMLButtonElement> }) => (
    <form>
      <div className="create-channel-container">
        <input type="text" placeholder="Create a channel" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} />
        <button className='create-channel-button' onClick={handleCreateChannel}>Confirm</button>
      </div>
    </form>
  );

export default CreateChannelForm;