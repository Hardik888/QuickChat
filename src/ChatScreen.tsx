import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import {useAuth} from './authContext';
import Message from './Message';

interface UserData {
  id: number;
  name: string;
  email: string;
}

const ChatScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null,
  );
  const [nextscreen, setNextScreen] = useState(false); // Changed variable name
  const [messageText, setMessageText] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState(''); // Added broadcastMessage state
  const [bitmojiMap, setBitmojiMap] = useState<{[email: string]: number}>({});
  const [loggedInUserId, setLoggedInUserId] = useState<number | undefined>(
    undefined,
  );
  const bitmojiImages = [
    require('../assets/bitmoji1.jpg'),
    require('../assets/bitmoji2.jpg'),
    require('../assets/bitmoji3.jpg'),
    require('../assets/bitmoji4.jpg'),
    require('../assets/bitmoji5.jpg'),
    require('../assets/bitmoji6.jpg'),
    require('../assets/bitmoji7.jpg'),
  ];

  const {email: loggedInUserEmail} = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://10.0.2.2:80/myapp/getdata.php');
        if (response.ok) {
          const data: UserData[] = await response.json();
          const loggedInUserData = data.find(
            user => user.email === loggedInUserEmail,
          );
          if (loggedInUserData) {
            const {id} = loggedInUserData;
            setLoggedInUserId(id);
          }

          setUserData(data.filter(user => user.email !== loggedInUserEmail));
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [loggedInUserEmail]);

  const getRandomBitmoji = (email: string) => {
    if (bitmojiMap[email] !== undefined) {
      return bitmojiImages[bitmojiMap[email]];
    } else {
      const randomIndex = Math.floor(Math.random() * bitmojiImages.length);
      setBitmojiMap(prev => ({...prev, [email]: randomIndex}));
      return bitmojiImages[randomIndex];
    }
  };

  const renderUserItem = ({item}: {item: UserData}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() =>
        setSelectedUserEmail(prev => (prev === item.email ? null : item.email))
      }>
      <Image
        source={getRandomBitmoji(item.email)}
        style={styles.bitmojiImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {selectedUserEmail === item.email && (
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Speed Post"
              value={messageText}
              onChangeText={text => setMessageText(text)}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                if (loggedInUserId !== undefined) {
                  sendMessage(loggedInUserId, item.id);
                }
              }}>
              <Text>🎯</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}
      </View>
    </TouchableOpacity>
  );

  const sendMessage = async (sender_id: number, receiver_id: number) => {
    if (!messageText) {
      return;
    }

    try {
      const response = await fetch(
        'http://10.0.2.2:80/myapp/sendnotification.php',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender_id: sender_id,
            receiver_id: receiver_id,
            message_text: messageText,
          }),
        },
      );

      if (response.ok) {
        setMessageText('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendMessageToAll = async () => {
    if (!broadcastMessage) {
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:80/myapp/broadcast.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: loggedInUserId,
          message_text: broadcastMessage,
        }),
      });

      if (response.ok) {
        setBroadcastMessage('');
      } else {
        console.error('Failed to send broadcast message');
      }
    } catch (error) {
      console.error('Error sending broadcast message:', error);
    }
  };

  if (!nextscreen) {
    return (
      <ImageBackground
        source={require('../assets/background3.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.allchats}
            onPress={() => setNextScreen(true)}>
            <Text style={styles.title}>ALL CHATS 💬</Text>
          </TouchableOpacity>
          <FlatList
            data={userData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderUserItem}
          />
          {/* Broadcast feature */}
          <View style={styles.broadcastContainer}>
            <TextInput
              style={styles.broadcastInput}
              placeholder="Broadcast message to all users"
              value={broadcastMessage}
              onChangeText={text => setBroadcastMessage(text)}
            />
            <TouchableOpacity
              style={styles.broadcastButton}
              onPress={sendMessageToAll}>
              <Text>📢</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  } else {
    return <Message />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
    width: '120%',
    height: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: -20,

    color: 'rgba(230, 180, 210, 1)',
    backgroundColor: 'rgba(20, 186, 280, 0.5)',
    borderRadius: 100,
    height: '20%',
    width: '30%',
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  bitmojiImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  userInfo: {
    flexDirection: 'column',
    marginLeft: 5,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(20, 186, 280, 0.5)',
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(20, 250, 150, 0.7)',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    width: '180%',
  },
  messageInput: {
    height: '55%',
    borderColor: 'grey',
    borderWidth: 0.5,
    marginTop: 18,
    paddingLeft: 1,
    borderRadius: 30,
  },
  sendButton: {
    height: '40%',
    padding: 5,
    backgroundColor: 'transparent',

    marginTop: 15,
  },
  allchats: {
    /* backgroundColor: 'rgba(136, 219, 188, 0.7) */
  },
  // Broadcast styles
  broadcastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  broadcastInput: {
    height: 35, // Adjust the height as needed
    borderColor: 'grey',
    borderWidth: 0.5,
    marginRight: 10,
    paddingLeft: 10,
    borderRadius: 20,
    paddingTop: 10, // Adjust padding as needed
  },
  broadcastButton: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 186, 280, 0.5)',
    borderRadius: 20,
  },
});

export default ChatScreen;

