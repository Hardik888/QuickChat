import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useAuth} from './authContext';
import ChatScreen from './ChatScreen';

interface UserData {
  id: number;
  name: string;
  email: string;
  opacity?: Animated.Value;
}

interface MessageData {
  id: string;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  receiver_name: string;
  message_text: string;
  timestamp: string;
}

const Message: React.FC = () => {
  const [nextscreen, setNextScreen] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(
    null,
  );
  const [messageHistory, setMessageHistory] = useState<MessageData[]>([]);
  const [loggedInUserId, setLoggedInUserId] = useState<number | undefined>(
    undefined,
  );

  const {email: loggedInUserEmail} = useAuth();
  const animatedValue = new Animated.Value(0);

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

          // Initialize opacity for each user
          const usersWithOpacity = data.map(user => ({
            ...user,
            opacity: new Animated.Value(1), // Set initial opacity to 1 for all users
          }));

          // Filter out the logged-in user's data
          setUserData(
            usersWithOpacity.filter(user => user.email !== loggedInUserEmail),
          );
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [loggedInUserEmail]);

  const fetchMessageHistory = async (receiverId: number) => {
    try {
      const response = await fetch(
        `http://10.0.2.2:80/myapp/getmessagedata.php?receiver_id=${receiverId}`,
      );
      if (response.ok) {
        console.log('Fetching message history for receiverId:', receiverId);
        const data: MessageData[] = await response.json();
        console.log('Received message data:', data);

        // Filter messages where either sender_id or receiver_id matches the selectedReceiverId and loggedInUserId
        const filteredMessages = data.filter(
          message =>
            ((message.sender_id === selectedReceiverId &&
              message.receiver_id === loggedInUserId) ||
              (message.receiver_id === selectedReceiverId &&
                message.sender_id === loggedInUserId)) &&
            selectedReceiverId !== undefined &&
            loggedInUserId !== undefined,
        );
        console.log('Filtered messages:', filteredMessages);

        setMessageHistory(filteredMessages);
      } else {
        console.error('Failed to fetch message history');
      }
    } catch (error) {
      console.error('Error fetching message history:', error);
    }
  };

  const handleNamePress = (userId: number) => {
    setSelectedReceiverId(userId);

    // Reset opacity to 0 for all users except the selected user
    Animated.parallel(
      userData.map(user =>
        Animated.timing(user.opacity!, {
          toValue: userId === user.id ? 1 : 0,
          duration: 50, // You can adjust the duration as needed
          useNativeDriver: true,
        }),
      ),
    ).start();

    // Reset opacity for all users after 6 seconds
    setTimeout(() => {
      Animated.parallel(
        userData.map(user =>
          Animated.timing(user.opacity!, {
            toValue: 1,
            duration: 50, // You can adjust the duration as needed
            useNativeDriver: true,
          }),
        ),
      ).start();
    }, 3000);

    fetchMessageHistory(userId);
  };

  const renderReceiverItem = ({item}: {item: UserData}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleNamePress(item.id)}>
      <Animated.View style={[styles.userInfo, {opacity: item.opacity}]}>
        <Text style={styles.userName}>{item.name}</Text>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({item}: {item: MessageData}) => (
    <View style={styles.messageItem}>
      <View
        style={[
          styles.messageContainer,
          item.sender_id === loggedInUserId
            ? styles.senderContainer
            : styles.receiverContainer,
        ]}>
        <Text
          style={
            item.sender_id === loggedInUserId
              ? styles.senderText
              : styles.receiverText
          }>
          {item.message_text}
        </Text>
      </View>
    </View>
  );

  if (!nextscreen) {
    return (
      <ImageBackground
        source={require('../assets/background3.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setNextScreen(true)}>
            <Text style={styles.title}>⬅️</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title2}>Recent Chats</Text>
          </View>
          <FlatList
            data={userData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderReceiverItem}
          />
          {selectedReceiverId !== null && (
            <View style={styles.messageContainer}>
              <FlatList
                data={messageHistory}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMessageItem}
              />
            </View>
          )}
        </View>
      </ImageBackground>
    );
  } else {
    return <ChatScreen />;
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
    height: '150%',
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(20, 480, 210, 0.2)',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 2,
    color: 'rgba(20, 186, 280, 0.5)',
  },
  userInfo: {
    flexDirection: 'column',
    marginLeft: 0,
    marginTop: 5,
  },
  messageContainer: {
    borderRadius: 5,
    marginTop: 5,
    padding: 10,
    maxWidth: '70%',
  },
  messageItem: {
    marginBottom: 10,
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(20, 186, 280, 0.1)',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(230, 180, 210, 0.2)',
  },
  senderText: {
    fontSize: 14,
    color: 'rgba(120, 186, 280,1)',
  },
  receiverText: {
    fontSize: 14,
    color: 'rgba(230, 180, 210, 1)',
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 120,
    marginTop: -32,
    color: 'rgba(20, 186, 280, 0.5)',
  },
});

export default Message;


