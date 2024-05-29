import { MouseEvent } from 'react';
import OriginalContent from './OriginalContent';
import Reply from './Reply';
import CreateReplyForm from './CreateReplyForm';

const ReplyList = ({ contents, repliesPost, username, handleLikeDislike, iconImage, newReply, setNewReply, handleCreateReply }: {
    contents: any[];
    repliesPost: number;
    username: string;
    handleLikeDislike: (messageId: string, like: string) => void;
    iconImage: string;
    newReply: string;
    setNewReply: Function;
    handleCreateReply: (messageId: string, event: MouseEvent<HTMLButtonElement>) => void;
}) => {
    const originalContent = contents.find(content => content.id == repliesPost);
    return (
        <div className='replies-list'>
            <OriginalContent 
                originalContent={originalContent} 
                username={username} 
                handleLikeDislike={handleLikeDislike} 
                iconImage={iconImage} 
            />
            {originalContent.message.replies.map((reply: string, index: number) => (
                <Reply 
                    key={index} 
                    reply={reply} 
                    username={username} 
                    handleLikeDislike={handleLikeDislike} 
                    iconImage={iconImage} 
                />
            ))}
            <CreateReplyForm 
                newReply={newReply} 
                setNewReply={setNewReply} 
                originalContent={originalContent} 
                handleCreateReply={handleCreateReply} 
            />
        </div>
    );
};

export default ReplyList;