import React, { useContext, useEffect, useRef, useState } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';

// Function to detect and convert URLs to clickable links
const formatMessage = (text) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [previewImg, setPreviewImg] = useState(null); // State for image preview
  const scrollEnd = useRef();

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatsData.chatsData[chatIndex].lastMessage = input;
            userChatsData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatsData.chatsData[chatIndex].rId == userData.id) {
              userChatsData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatsData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }

    setInput('');
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');

    if (hour > 12) {
      date = hour - 12 + ':' + minute + ' PM';
    } else if (hour === 0) {
      date = 12 + ':' + minute + ' AM';
    } else {
      date = hour + ':' + minute + ' AM';
    }

    return date;
  };

  const sendImage = async (e) => {
    const fileUrl = await upload(e.target.files[0]);

    if (fileUrl && messagesId) {
      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          image: fileUrl,
          createdAt: new Date(),
        }),
      });

      const userIDs = [chatUser.rId, userData.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, 'chats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === messagesId);
          userChatsData.chatsData[chatIndex].lastMessage = 'Image';
          userChatsData.chatsData[chatIndex].updatedAt = Date.now();
          await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData,
          });
        }
      });
    }
  };

  const handleImageClick = (imgUrl) => {
    setPreviewImg(imgUrl);
  };

  const closePreview = () => {
    setPreviewImg(null);
  };

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? '' : 'hidden'}`}>
      <div className="chat-user">
        <img src={chatUser ? chatUser.userData.avatar : assets.profile_img} alt="" />
        <p>
          {chatUser ? chatUser.userData.name : 'Richard Sanford'}{' '}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : null}
        </p>
        <img onClick={() => setChatVisible(false)} className="arrow" src={assets.arrow_icon} alt="" />
        <img className="help" src={assets.help_icon} alt="" />
      </div>

      {/* Messages section */}
      <div className="chat-msg">
        <div ref={scrollEnd}></div>
        {messages.map((msg, index) => {
          return (
            <div key={index} className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
              {msg['image'] ? (
                <img
                  className="msg-img"
                  src={msg['image']}
                  alt=""
                  onDoubleClick={() => handleImageClick(msg['image'])}
                />
              ) : (
                <p
                  className="msg"
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg['text']),
                  }}
                />
              )}
              <div>
                <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                <p>{convertTimestamp(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="image-preview">
          <img src={previewImg} alt="Preview" />
          <span className="close-btn" onClick={closePreview}>
            ✖
          </span>
        </div>
      )}

      {/* Input section */}
      <div className="chat-input">
        <input
          onKeyDown={(e) => (e.key === 'Enter' ? sendMessage() : null)}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        <input onChange={sendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? '' : 'hidden'}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
