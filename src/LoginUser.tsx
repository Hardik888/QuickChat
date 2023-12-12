import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import ChatScreen from './ChatScreen';
import {useAuth} from './authContext';
import CreateUser from './CreateUser';

const LoginUser = () => {
  const {email, setAuthEmail, setAuthId} = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signup, setSignup] = useState<boolean>(false);
  const [Isregistered, setIsRegistered] = useState<boolean>(false);
  const handleLogin = () => {
    if (email !== '' && password !== '') {
      var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      var data = {
        id: Number,
        email: email,
        password: password,
      };

      fetch('http://10.0.2.2:80/myapp/login.php', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      })
        .then(response => response.json())
        .then(response => {
          if (response[0].result === 'Login successful!') {
            // Handle successful login

            console.log('Login successful!');

            setAuthEmail(email);
            setAuthId(response[0].id);

            setIsRegistered(true);
          } else {
            setError(response[0].result);
          }
        })
        .catch(err => {
          setError(err);
          console.log(err);
        });
    } else {
      setError('All fields are required!');
    }
  };
  if (Isregistered) {
    return <ChatScreen />;
  } else if (signup) {
    return <CreateUser />;
  } else {
    return (
      <ImageBackground
        source={require('../assets/background.jpg')} // Adjust the path based on your asset location
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              placeholder="Your Email"
              placeholderTextColor="#003f5c"
              onChangeText={text => setAuthEmail(text)}
            />
          </View>

          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              placeholder="Your Password"
              placeholderTextColor="#003f5c"
              secureTextEntry={true}
              onChangeText={text => setPassword(text)}
            />
          </View>

          {error !== '' && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => setSignup(true)}>
            <Text style={styles.loginText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  inputView: {
    backgroundColor: 'rgba(110, 249, 328, 0.1)',
    /* backgroundColor: 'transparent', */
    borderRadius: 100,
    width: '70%',
    height: 58,
    marginBottom: 25,
    alignItems: 'center',
    flexDirection: 'row',
  },
  TextInput: {
    height: 35,
    flex: 1,
    padding: 9,

    marginLeft: 10,
    color: '#003f5c',
  },
  loginBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    /* backgroundColor: 'rgba(136, 219, 188, 0.7)', */
    /*  backgroundColor: 'transparent', */
  },
  loginText: {
    color: 'rgba(110, 249, 328, 0.7)',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
});

export default LoginUser;
