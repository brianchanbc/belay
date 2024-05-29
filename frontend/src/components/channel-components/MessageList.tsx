import { useNavigate } from "react-router-dom"
import moment from 'moment';
import MessageContent from './MessageContent';
import EmojiButtons from './EmojiButtons';

// Display list of messages in a channel
const MessageList = ({ contents, username, handleLikeDislike, setRepliesPane, setRepliesPost, setChannelFocusSection, repliesPost, repliesPane, iconImage, focusChannel }: {
    contents: any[]; 
    username: string; 
    handleLikeDislike: (messageId: string, like: string) => void; 
    setRepliesPane: (value: boolean) => void; 
    setRepliesPost: (postId: number) => void; 
    setChannelFocusSection: (section: string) => void; 
    repliesPost: number; 
    repliesPane: boolean; 
    iconImage: string; 
    focusChannel: number;
}) => {
    const navigate = useNavigate();

    return (
        <div className='content-list'>
            {contents.map(content => (
                <div key={content.id} className='content'>
                    <img className='message-icon' src={iconImage} alt='icon' />
                    <div className='message-text'>
                        <span className='messager'>{content.message.username}</span>
                        <span className='message-time'> {moment(content.message.createdAt).fromNow()}</span>
                        <div>
                            {content.message.content.split(' ').map((word: string, index: number) => 
                                <MessageContent key={index} word={word} index={index} />
                            )}
                        </div>
                        <div className='emoji-buttons'>                      
                            <EmojiButtons message={content.message} username={username} handleLikeDislike={handleLikeDislike} />
                            <button 
                                className='reply-button' 
                                onClick={() => {
                                    setRepliesPane(true);
                                    setRepliesPost(content.id);
                                    setChannelFocusSection('reply-view');
                                    navigate(`/channel/${focusChannel}/${content.id}`);
                                }}
                            >
                                Reply
                            </button>
                        </div>
                        <span className='message-replies'
                            onClick={() => {
                                if (content.id === repliesPost) {
                                    if (repliesPane) {
                                        setChannelFocusSection('message-view');
                                        navigate(`/channel/${focusChannel}`);
                                    } else {
                                        setChannelFocusSection('reply-view');
                                        navigate(`/channel/${focusChannel}/${content.id}`);
                                    }
                                    setRepliesPane(!repliesPane);
                                } else {
                                    setChannelFocusSection('reply-view');
                                    setRepliesPane(true);
                                    setRepliesPost(content.id);
                                    navigate(`/channel/${focusChannel}/${content.id}`);
                                }
                            }}
                        >
                            {
                                (() => {
                                    const replies = content.message.replies.length;
                                    if (replies) {
                                        return replies === 1 ? `${replies} reply` : `${replies} replies`;
                                    } else {
                                        return "";
                                    }
                                })()
                            }
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;