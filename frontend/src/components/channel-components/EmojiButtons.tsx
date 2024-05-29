
// Emoji buttons for liking and disliking messages
const EmojiButtons = ({ message, username, handleLikeDislike }: 
    { message: any, username: string, handleLikeDislike: (action: string, messageId: string) => void }) => (
    <div className='emoji-buttons'>                      
        <button 
            className={`like-button ${message.likes.includes(username) ? 'highlight' : ''}`} 
            onClick={() => handleLikeDislike('like', message.messageId)}
            title={message.likes.join(', ')}
        >
            👍 <span className='like-count'>{message.likes.length ? message.likes.length : ""}</span>
        </button>
        <button 
            className={`dislike-button ${message.dislikes.includes(username) ? 'highlight' : ''}`} 
            onClick={() => handleLikeDislike('dislike', message.messageId)}
            title={message.dislikes.join(', ')}
        >
            👎 <span className='dislike-count'>{message.dislikes.length ? message.dislikes.length : ""}</span>
        </button>
    </div>
)

export default EmojiButtons;