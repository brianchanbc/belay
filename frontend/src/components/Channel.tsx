import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import ScreenSize from './ScreenSize';
import iconImage from '../assets/Icon.jpg';
import CreateMessageForm from './channel-components/CreateMessageForm';
import CreateChannelForm from './channel-components/CreateChannelForm';
import ChannelList from './channel-components/ChannelList';
import MessageList from './channel-components/MessageList';
import ReplyList from './channel-components/ReplyList';

// Channel view
const Channel = ({ 
    errorMessage,
    setErrorMessage,
    username,
    tokenKey,
    currentView,
    setCurrentView,
    focusView,
}: {
    errorMessage: string,
    setErrorMessage: Function,
    username: string,
    tokenKey: string,
    currentView: string,
    setCurrentView: Function,
    focusView: string,
}) => {
    const [channels, setChannels] = useState<any[]>([]);
    const [contents, setContents] = useState<any[]>([]);
    const [focusChannel, setFocusChannel] = useState<number | null>(null);
    const [focusChannelName, setFocusChannelName] = useState<string>('Select a channel');
    const [newChannelName, setNewChannelName] = useState<string>('');    
    const [deviceType, setDeviceType] = useState<string>('desktop');
    const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
    const [repliesPane, setRepliesPane] = useState<boolean>(false);
    const [repliesPost, setRepliesPost] = useState<number | null>(null);
    const [newReply, setNewReply] = useState<string>('');
    const [newMessage, setNewMessage] = useState<string>('');
    const [channelFocusSection, setChannelFocusSection] = useState<string>('channel-view');
    const screenSize = ScreenSize();
    const { cid: cidString, tid: tidString } = useParams();
    const cid = Number(cidString);
    const tid = Number(tidString);
    const navigate = useNavigate();

    // When a channel is chosen, set the focus channel and channel name
    const handleChannelClick = (channelId: number, channelName: string) => {
        setFocusChannel(channelId);
        setFocusChannelName(channelName);
        setChannelFocusSection('message-view');
        setErrorMessage('');
    }

    // Create a new channel
    const handleCreateChannel = (event: React.FormEvent) => {
        event.preventDefault();
        axios.post('/api/create_channel', {
            channelName: newChannelName
        }, {
            headers: {
                apikey: localStorage.getItem(tokenKey)
            },
        }).then(() => {
            setNewChannelName('');
            setErrorMessage('');
        }).catch((error) => {
            console.log(error);
            setErrorMessage(error.response.data.error);
        });
    }

    // Create a new reply
    const handleCreateReply = (messageId: string, event: React.FormEvent) => {
        event.preventDefault();
        axios.post('/api/create_message/' + focusChannelName, {
            username: username,
            messageContent: newReply,
            repliesTo: messageId
        }, {
            headers: {
                apikey: localStorage.getItem(tokenKey)
            }
        }).then(() => {
            setNewReply('');
        }).catch((error) => {
            console.log(error);
        });
    }

    // Create a new message
    const handleCreateMessage = (event: React.FormEvent) => {
        event.preventDefault();
        axios.post('/api/create_message/' + focusChannelName, {
            username: username,
            messageContent: newMessage
        }, {
            headers: {
                apikey: localStorage.getItem(tokenKey)
            }
        }).then(() => {
            setNewMessage('');
        }).catch((error) => {
            console.log(error);
        });
    }

    // Like or dislike a message
    const handleLikeDislike = (action: string, messageId: string) => {
        axios.post('/api/update_reaction/' + messageId, {
            username: username,
            emoji: action,
        }, {
            headers: {
                apikey: localStorage.getItem(tokenKey)
            }
        }).then(() => {
        }).catch((error) => {
            console.log(error);
        });
    }
    
    useEffect(() => {
        setCurrentView('/channel');
        // Handle routing to a specific channel 
        if (focusView == '1') {
            const channel = channels.find(channel => channel.id == cid);
            if (channel) {
                document.title = `Belay - Channel ${channel.name}`;
                handleChannelClick(cid, channel.name);
                setErrorMessage('');
            } else {
                setErrorMessage('Channel not found');
            }
        // Handle routing to a specific message reply
        } else if (focusView == '2') {
            const channel = channels.find(channel => channel.id == cid);
            if (channel) {
                handleChannelClick(cid, channel.name);
                const content = contents.find(content => content.id == tid);
                if (content) {
                    document.title = `Belay - Message ${tid}`;
                    setChannelFocusSection('reply-view');
                    setRepliesPane(true);
                    setRepliesPost(tid);
                    setErrorMessage('');
                } else {
                    setErrorMessage('Message not found');
                }
            } else {
                setErrorMessage('Channel not found');
            }
        }
    }, [channels]);
    
    useEffect(() => {
        // Set device type based on screen size
        const { width } = screenSize;
        if (width < 770) {
            setDeviceType('mobile');
        } else {
            setDeviceType('desktop');
        }
    }, [screenSize]);

    useEffect(() => {
        document.title = "Belay - Channel";
        // Fetch channels and number of unread messages
        const fetchChannels = async () => {
          if (currentView === '/channel') {
            try {
                const getChannelsResponse = await axios.get('/api/get_channels', {
                    headers: {
                    apikey: localStorage.getItem(tokenKey),
                    }
                });
                setChannels(getChannelsResponse.data);
        
                const getUnreadResponse = await axios.get('/api/get_unread_message_counts/' + username, {
                    headers: {
                    apikey: localStorage.getItem(tokenKey),
                    }
                });
                setUnreadMessages(getUnreadResponse.data);
            } catch (error) {
                console.log(error);
            }
          } else {
                setRepliesPane(false);
                setRepliesPost(null);
                setNewChannelName('');
                setNewReply('');
                setNewMessage('');
                setFocusChannel(null);
                setFocusChannelName('Select a channel');
                setUnreadMessages([]);
          }
        };
        // Fetch channels and unread messages every 1000ms
        const intervalId = setInterval(fetchChannels, 1000);
        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [currentView]);

    useEffect(() => {
        if (focusChannel) {
            setRepliesPost(focusChannel);
            setRepliesPane(false);
            setNewMessage('');

            // Fetch messages and update last seen
            const fetchMessagesAndUpdateLastSeen = async () => {
            try {
                const response = await axios.get('/api/get_messages/' + focusChannel, {
                headers: {
                    apikey: localStorage.getItem(tokenKey)
                }
                });
                setContents(response.data);
                console.log(response.data);
        
                await axios.put('/api/update_last_seen_message/' + focusChannel, {
                username: username
                }, {
                headers: {
                    apikey: localStorage.getItem(tokenKey)
                }
                });
            } catch (error) {
                console.log(error);
            }
            };
            
            // Fetch messages and update last seen every 500ms
            const intervalId = setInterval(fetchMessagesAndUpdateLastSeen, 500);
            // Clear interval 
            return () => clearInterval(intervalId);
        }
    }, [focusChannel]);
    
    return (
        <div className='channel-screen'>
        <div className={`channel-container ${channelFocusSection === 'channel-view' && deviceType === 'mobile' ? 'active-view' : ''}`}>
            <div className="channel-title">Channels</div>
            <CreateChannelForm newChannelName={newChannelName} setNewChannelName={setNewChannelName} handleCreateChannel={handleCreateChannel} />
            {errorMessage && <p style={{ textAlign: 'center', color: 'yellow' }}>{errorMessage}</p>}
            <ChannelList channels={channels} unreadMessages={unreadMessages} focusChannel={focusChannel || 0} handleChannelClick={handleChannelClick} />
        </div>
          <div className={`content-container ${channelFocusSection === 'message-view' && deviceType === 'mobile' ? 'active-view' : ''} ${repliesPane ? 'content-container-replies-open' : ''}`}>
            {channelFocusSection === 'message-view' && deviceType === 'mobile' && (
                <button className='close-button' onClick={() => {
                    setChannelFocusSection('channel-view');
                    navigate('/channel');
                }}>
                    ←
                </button>
            )}
            <div className='content-title'>{focusChannelName}</div>
            <MessageList 
                contents={contents} 
                username={username} 
                handleLikeDislike={handleLikeDislike} 
                setRepliesPane={setRepliesPane} 
                setRepliesPost={setRepliesPost} 
                setChannelFocusSection={setChannelFocusSection} 
                repliesPost={repliesPost || 0} 
                repliesPane={repliesPane} 
                iconImage={iconImage} 
                focusChannel={focusChannel || 0}
            />
            {focusChannel && (
              <CreateMessageForm newMessage={newMessage} setNewMessage={setNewMessage} handleCreateMessage={handleCreateMessage} focusChannelName={focusChannelName} />
            )}
          </div>
          {repliesPane && (
            <div className={`replies-pane ${channelFocusSection === 'reply-view' && deviceType === 'mobile' ? 'active-view' : ''}`}>
             <button className='close-button' onClick={() => {
                setRepliesPane(!repliesPane);
                setChannelFocusSection('message-view');
                navigate(`/channel/${focusChannel}`);
            }}>
                ←
            </button>
              <div className='replies-title'>Replies</div>
            <ReplyList 
                contents={contents} 
                repliesPost={repliesPost || 0} 
                username={username} 
                handleLikeDislike={handleLikeDislike} 
                iconImage={iconImage} 
                newReply={newReply} 
                setNewReply={setNewReply} 
                handleCreateReply={handleCreateReply} 
            />
            </div>
          )}
        </div>
    )
}
  
export default Channel