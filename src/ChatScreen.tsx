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
  const [messageText, setMessageText] = useState('');
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

          const {id} = loggedInUserData;
          setLoggedInUserId(id);
          // Filter out the logged-in user's data
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
              value={messageText}
              onChangeText={text => setMessageText(text)}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendMessage(loggedInUserId, item.id)}>
              <Text>+</Text>
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
        // You might want to update the UI or do something after a successful send
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background3.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.title}>Connect</Text>
        <FlatList
          data={userData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderUserItem}
        />
      </View>
    </ImageBackground>
  );
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
    height: '200%',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'rgba(20, 186, 280, 0.5)',
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
  },
  messageInput: {
    flex: 1,
    height: '50%',
    borderColor: 'gray',
    borderWidth: 0.5,
    marginTop: 18,
    paddingLeft: 2,
    borderRadius: 10,
  },
  sendButton: {
    padding: 4,
    backgroundColor: 'rgba(20, 186, 280, 0.5)',
    borderRadius: 5,
    marginTop: 20,
  },
});

export default ChatScreen;
