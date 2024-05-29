import IndividualChannel from "./IndividualChannel";

// Map through the channels and render each channel
const ChannelList = ({ channels, unreadMessages, focusChannel, handleChannelClick }: { 
    channels: any[]; 
    unreadMessages: any; 
    focusChannel: number; 
    handleChannelClick: Function 
}) => (
    <div className="channel-list">
        {channels.map(channel => (   
            <IndividualChannel 
                key={channel.id}
                channel={channel} 
                unreadMessages={unreadMessages} 
                focusChannel={focusChannel} 
                handleChannelClick={handleChannelClick} 
            />
        ))}
    </div>
);
export default ChannelList;