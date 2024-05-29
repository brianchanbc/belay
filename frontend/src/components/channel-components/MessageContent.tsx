
function findUrls(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex);
}

function isImageUrl(url: string) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

// Component to display the content of a message
const MessageContent = ({ word, index }: {word: string, index: number}) => {
    const urls = findUrls(word);
    // If the message is a URL and contains an image, display the image, otherwise display the message
    if (urls && urls.some(isImageUrl)) {
        return (
            <span key={index} className='message-content-with-image'>
            {word}
            <img src={urls[0]} className='message-img' alt="" />
            </span>
        );
    } else {
        return <span key={index} className='message-content'>{word}</span>;
    }
};

export default MessageContent;