import moment from 'moment';
import MessageContent from './MessageContent';
import EmojiButtons from './EmojiButtons';

// Display the original content of a message in reply view
const OriginalContent = ({ originalContent, username, handleLikeDislike, iconImage }: { 
    originalContent: any, 
    username: string, 
    handleLikeDislike: (messageId: string, like: string) => void, 
    iconImage: string 
}) => (
    <div key={originalContent.id} className='content'>
        <img className='message-icon' src={iconImage} alt='icon' />
        <div className='message-text'>
            <span className='messager'>{originalContent.message.username}</span>
            <span className='message-time'> {moment(originalContent.message.createdAt).fromNow()}</span>
            <div>
                {originalContent.message.content.split(' ').map((word: string, index: number) => 
                    <MessageContent key={index} word={word} index={index} />
                )}
            </div>
            <EmojiButtons message={originalContent.message} username={username} handleLikeDislike={handleLikeDislike} />                   
        </div>
    </div>
);

export default OriginalContent;