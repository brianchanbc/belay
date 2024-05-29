import { Link } from 'react-router-dom';

// Display individual channel name, unread message count, when clicked route to the respective channel
const IndividualChannel = ({ channel, unreadMessages, focusChannel, handleChannelClick }: 
    { channel: any, unreadMessages: any[], focusChannel: number, handleChannelClick: Function }) => {
    const unreadMessage = unreadMessages.find(unread => unread.channel_id === channel.id);
    const unreadCount = unreadMessage ? unreadMessage.unread_message_count : "";
    const isActive = focusChannel === channel.id; 
    return (
        <Link to={`/channel/${channel.id}`} className="channel-link">
            <div 
                key={channel.id} 
                className={`channel ${isActive ? 'active' : ''}`}
                onClick={() => handleChannelClick(channel.id, channel.name, true)}
            >
                {channel.name} {unreadCount && <span className="unreadCount">{unreadCount}</span>}
            </div>
        </Link>
    );
};

export default IndividualChannel;