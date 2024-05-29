import moment from 'moment';
import MessageContent from './MessageContent';
import EmojiButtons from './EmojiButtons';

// Display the content of a reply
const Reply = ({ reply, username, handleLikeDislike, iconImage }: 
    { reply: any, username: string, handleLikeDislike: (messageId: string, like: string) => void, iconImage: string }) => (
    <div className='reply-box'>
        <img className='message-icon' src={iconImage} alt='icon' />
        <div className='reply'>
            <span className='replyer'>{reply.username}</span>
            <span className='reply-time'>{moment(reply.createdAt).fromNow()}</span>
            <div>
                {reply.content.split(' ').map((word: string, index: number) => 
                    <MessageContent key={index} word={word} index={index} />
                )}
            </div>
            <EmojiButtons message={reply} username={username} handleLikeDislike={handleLikeDislike} />
        </div>
    </div>
);

export default Reply;