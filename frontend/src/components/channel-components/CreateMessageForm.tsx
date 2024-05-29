
// Form to create a new message in a channel
const CreateMessageForm = ({ newMessage, setNewMessage, handleCreateMessage, focusChannelName }: 
    { newMessage: string, setNewMessage: Function, handleCreateMessage: React.MouseEventHandler<HTMLButtonElement>, focusChannelName: string }) => (
    <div className='create-message-container'>
        <form>
            <div className="create-message">
            <input type="text" placeholder={`Message #${focusChannelName}`} value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button className='create-message-button' onClick={handleCreateMessage}>Confirm</button>
            </div>
        </form>
    </div>
);

export default CreateMessageForm;