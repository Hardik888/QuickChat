import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from './authContext';
import ChatScreen from './ChatScreen';

interface UserData {
  id: number;
  name: string;
  email: string;
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
  const [nextscreen, setnextscreen] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(
    null,
  );
  const [messageHistory, setMessageHistory] = useState<MessageData[]>([]);
  const [loggedInUserId, setLoggedInUserId] = useState<number | undefined>(
    undefined,
  );

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

  const fetchMessageHistory = async (receiverId: number) => {
    try {
      const response = await fetch(
        `http://10.0.2.2:80/myapp/getmessagedata.php?receiver_id=${receiverId}`,
      );
      if (response.ok) {
        console.log('Fetching message history for receiverId:', receiverId);
        const data: MessageData[] = await response.json();
        console.log('Received message data:', data);
        const convertedReceiverId = selectedReceiverId?.toString();
        const convertedUserId = loggedInUserId?.toString();

        console.log('Converted Receiver Id:', convertedReceiverId);
        console.log('Converted User Id:', convertedUserId);

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
  const renderReceiverItem = ({item}: {item: UserData}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        setSelectedReceiverId(item.id);
        fetchMessageHistory(item.id);
      }}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
      </View>
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
          <TouchableOpacity onPress={() => setnextscreen(true)}>
            <Text style={styles.title}>⬅️</Text>
          </TouchableOpacity>
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
    height: '200%',
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'rgba(20, 186, 280, 0.5)',
  },
  userInfo: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  messageContainer: {
    borderRadius: 5,
    marginTop: 5, // Adjusted marginTop for closer spacing
    padding: 10,
    maxWidth: '70%', // Adjusted maxWidth to limit message width
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
});

export default Message;

