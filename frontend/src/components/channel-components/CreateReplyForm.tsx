
// Form to create a new reply to a message in a channel
const CreateReplyForm = ({ newReply, setNewReply, originalContent, handleCreateReply }: 
    { newReply: string, setNewReply: Function, originalContent: any, handleCreateReply: (messageId: string, event: React.MouseEvent<HTMLButtonElement>) => void }) => (
    <div>
        <form>
        <div className="create-reply">
            <input type="text" placeholder="Reply..." value={newReply} onChange={e => setNewReply(e.target.value)} />
            <button className='create-reply-button' onClick={(event) => handleCreateReply(originalContent.message.messageId, event)}>Confirm</button>
        </div>
        </form>
    </div>
);

export default CreateReplyForm;