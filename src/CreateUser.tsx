import React, {useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import LoginUser from './LoginUser';

interface CreateUserProps {}

const CreateUser: React.FC<CreateUserProps> = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [Isregistered, setIsRegistered] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const Register = () => {
    if (name !== '' && email !== '' && password !== '') {
      var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      var Data = {
        name: name,
        email: email,
        password: password,
      };
      fetch('http://10.0.2.2:80/myapp/authentication.php', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(Data),
      })
        .then(response => response.json())
        .then(response => {
          setMsg(response[0].result);
        })
        .catch(err => {
          setError(err);
          console.log(err);
        });

      setMsg('Registration successful!');
      setIsRegistered(true);
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setError('All fields are required!');
    }
  };

  const checkUser = () => {
    if (name !== '') {
      var url = 'http://10.0.2.2:80/myapp/checkuser.php';
      var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      var Data = {
        name: name,
      };
      fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(Data),
      })
        .then(response => response.json())
        .then(response => {
          setError(response[0].result);
        })
        .catch(err => {
          setError(err);
          console.log(err);
        });
    }
  };

  const checkEmail = () => {
    if (email !== '') {
      var url = 'http://10.0.2.2:80/myapp/checkemail.php';
      var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      var Data = {
        email: email,
      };
      fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(Data),
      })
        .then(response => response.json())
        .then(response => {
          setError(response[0].result);
        })
        .catch(err => {
          setError(err);
          console.log(err);
        });
    }
  };

  const checkPassword = () => {
    if (password.length < 8) {
      setError('Password is less than 8 characters!');
    } else {
      setError(''); // Clear any previous password-related errors
    }
  };

  if (!Isregistered) {
    return (
      <ImageBackground
        source={require('../assets/background.jpg')} // Adjust the path based on your asset location
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.container}>
          <StatusBar />
          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              placeholder="Name"
              placeholderTextColor="#003f5c"
              onChangeText={text => setName(text)}
              onBlur={checkUser}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              placeholder="Email"
              placeholderTextColor="#003f5c"
              onChangeText={text => setEmail(text)}
              onBlur={checkEmail}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              placeholder="Password"
              placeholderTextColor="#003f5c"
              secureTextEntry={true}
              onChangeText={text => setPassword(text)}
              onBlur={checkPassword}
            />
          </View>
          <TouchableOpacity onPress={Register} style={styles.loginBtn}>
            <Text style={styles.loginText}>SIGN UP</Text>
          </TouchableOpacity>

          {error !== '' && <Text style={styles.errorText}>{error}</Text>}
          {msg !== '' && <Text style={styles.successText}>{msg}</Text>}
        </View>
      </ImageBackground>
    );
  } else {
    return <LoginUser />;
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
  successText: {
    color: 'green',
    marginTop: 10,
  },
});

export default CreateUser;
