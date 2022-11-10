import React, { useState, useEffect } from 'react';
import { View, Modal, ScrollView, Linking } from 'react-native';
import { Icon, Input, Text, Button } from '@ui-kitten/components';
import { ThemeContext } from '../../theme-context';
import { Header } from '../components/headers.component';
import { ViewableArea, ContentContainer, PopUpContainer } from '../components/content.component';
import { styles } from './userSettings.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapConfigButtonGroup } from '../components/UserSettingsModals/mapConfigButtonGroup.component.js';

export function UserSettings(props) {

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [firstNameText, setFirstNameText] = useState(props.firstName);
  const [lastNameText, setLastNameText] = useState(props.lastName);
  const [emailText, setEmailText] = useState(props.email);
  const [emailTouched, setEmailTouched] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordVerify, setNewPasswordVerify] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [codeChanged, setCodeChanged] = useState(false);
  const [mapConfig, setMapConfig] = useState(true)
  const [logoutVisible, setLogoutVisible] = useState(false)

  useEffect(() => {
      async function fetchData() {
          setIsVerified(await AsyncStorage.getItem('@isVerified') === 'true')
          setMapConfig(await AsyncStorage.getItem("@mapConfig"))
      }
      fetchData()
  })

  const themeContext = React.useContext(ThemeContext);

  const editIcon = (props) => (
    <Icon {...props} fill='white' name='edit'/>
  );

  const closeIcon = (props) => (
    <Icon {...props} fill='white' name='close'/>
  );

  const confirmIcon = (props) => (
    <Icon {...props} fill='white' name='checkmark'/>
  );

  const faqIcon = (props) => (
    <Icon {...props} fill='white' name='globe'/>
  );

  const themeIcon = (props) => {
    if(themeContext.theme == 'light') {
      return(
        <Icon {...props} fill='white' name='moon'/>
      );
    }

    return(
      <Icon {...props} fill='white' name='sun'/>
    );
  }

  const cancelEditProfile = () => {
    setFirstNameText(props.firstName)
    setLastNameText(props.lastName)
    setEmailText(props.email)
    setEmailTouched(false)
    setNewPassword('')
    setNewPasswordVerify('')
    setPasswordTouched(false)
    setSettingsModalVisible(!settingsModalVisible)
  }

  const confirmEditProfile = async () => {
    const editedInfo = {}
    // if any profile data input is empty do not update that data
    if (firstNameText) editedInfo.firstname = firstNameText
    if (lastNameText) editedInfo.lastname = lastNameText
    if (emailText) editedInfo.email = emailText
    if (newPassword) editedInfo.password = newPassword

    updateUser(editedInfo)
  }

  // backend call
  const updateUser = async (editedInfo) => {
    let success = false
    let result = null

    try {
      console.log("Trying to update a user")

      const response = await fetch('https://p2bp.herokuapp.com/api/users/', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + props.token
        },

        body: JSON.stringify(editedInfo)
      })

      result = await response.text()
      console.log(result)
      success = true
    } catch (error) {
        console.log("ERROR: " + error)
    }

    // if user details were properly updated in the backend change them locally
    if(success) {
      if (editedInfo.firstname) {
          props.setFirstName(editedInfo.firstname)
          await AsyncStorage.setItem('@firstName', props.firstName)
      }
      if (editedInfo.lastname) {
          props.setLastName(editedInfo.lastname)
          await AsyncStorage.setItem('@lastName', props.lastName)
      }
      if (editedInfo.email) {
          props.setEmail(editedInfo.email)
          await AsyncStorage.setItem('@email', props.email)
      }

      setNewPassword('')
      setNewPasswordVerify('')
      setPasswordTouched(false)
      setSettingsModalVisible(!settingsModalVisible)
    } else {
      cancelEditProfile()
    }
  }

  const logOut = async () => {
    // Possible improvements
    // 1) Clean the async storaged
    // 2) Delete the user token (log out a user from a session)
    await setLogoutVisible(false)
    await AsyncStorage.clear();
    await props.setSignedIn(false);
    await props.navigation.navigate('Title');
  }

  const verifyEmail = async () => {
        const email = await AsyncStorage.getItem('@email');

        let success = false;
        let result = null;

        try {
            const response = await fetch(`https://p2bp.herokuapp.com/api/verify/?email=${email}&code=${verificationCode}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            result = await response.text();
            console.log(result);
            success = response.status === 200;

        } catch (error) {
            console.log('ERROR: ' + error);
        }

        if(success) {
            setIsVerified(true);
            await AsyncStorage.setItem('@isVerified', 'true');
            setVerifyModalVisible(false);
        } else {
            setVerificationError(true);
        }
  }

  const resendCode = async () => {
        let success = false;
        let result = null;

        try {
            const response = await fetch('https://p2bp.herokuapp.com/api/verify/newcode', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + props.token
                }
            });

            result = await response.text();
            console.log(result);
            success = response.status === 200;

        } catch (error) {
            console.log('ERROR: ' + error);
        }

        if (success) {
            setCodeChanged(true);
        }
  }

  const checkPassword = () => {
    let rules = [];
    if (newPassword.length < 8) rules.push('Must be at least 8 characters long');
    if (/\s/g.test(newPassword)) rules.push('Must not have any spaces');
    if (!/\d/g.test(newPassword)) rules.push('Must have at least one digit');
    if (!/[!@#$%^&*]/g.test(newPassword)) rules.push('Must have one of the following: ! @ # $ % ^ & *');
    if (!/[A-Z]/g.test(newPassword)) rules.push('Must have at least one uppercase letter');

    return rules;
  }

  const checkEmail = () => {
    if (!/.+\@.+\..+/g.test(emailText)) return false;
    if (/\s/g.test(emailText)) return false;
    return true;
  }

  const launchFaq = async () =>{
    const url = 'http://p2bp.herokuapp.com/faq'
    await Linking.canOpenURL(url);
    Linking.openURL(url);
  }

  const isValidEmail = checkEmail();
  const passwordProblems = checkPassword();

  return (
    <ViewableArea>
      <Header text={'User Settings'}/>

      <ContentContainer>
        <Modal animationType="slide" visible={settingsModalVisible}  onRequestClose={() => {setSettingsModalVisible(!settingsModalVisible)}}>
          <ViewableArea>
            <Header text={'Edit Profile'}/>
            <ContentContainer>
              <ScrollView style={styles.container}>

                <Text category='s1'>First Name:</Text>
                <Input
                  placeholder={props.firstName}
                  value={firstNameText}
                  onChangeText={nextValue => setFirstNameText(nextValue)}
                />

                <Text category='s1'>Last Name:</Text>
                <Input
                  placeholder={props.lastName}
                  value={lastNameText}
                  onChangeText={nextValue => setLastNameText(nextValue)}
                />

                <Text category='s1'>Email:</Text>
                <Input
                  placeholder={props.email}
                  value={emailText}
                  onChangeText={nextValue => setEmailText(nextValue)}
                  autoCapitalize='none'
                  onFocus={() => setEmailTouched(true)}
                  caption={
                    emailTouched && !isValidEmail &&
                    <Text style={styles.errorMsg}>
                        Email address is not valid
                    </Text>
                  }
                />

                <Text category='s1'>Change password:</Text>
                <Input
                  placeholder = 'New password'
                  value={newPassword}
                  secureTextEntry={true}
                  onFocus={() => setPasswordTouched(true)}
                  onChangeText={nextValue => setNewPassword(nextValue)}
                  caption={
                    passwordTouched && passwordProblems.length > 0 &&
                    <Text style={styles.errorMsg}>
                        {passwordProblems.join('\n')}
                    </Text>
                  }
                />
                <Input
                  placeholder = 'Retype new password'
                  value={newPasswordVerify}
                  secureTextEntry={true}
                  onChangeText={nextValue => setNewPasswordVerify(nextValue)}
                  caption={
                    newPassword !== newPasswordVerify &&
                    <Text style={styles.errorMsg}>
                        {'Passwords do not match'}
                    </Text>
                  }
                />

                <View style={styles.buttonRow}>
                  <Button
                    status={'danger'}
                    style={styles.button}
                    onPress={() => cancelEditProfile()}
                    accessoryLeft = {closeIcon}
                  >
                    CANCEL
                  </Button>
                  <Button
                    disabled={newPassword && passwordProblems.length > 0 || newPassword !== newPasswordVerify}
                    status={'success'}
                    style={styles.button}
                    onPress={() => confirmEditProfile()}
                    accessoryRight = {confirmIcon}
                  >
                    CONFIRM
                  </Button>
                </View>
              </ScrollView>
            </ContentContainer>
          </ViewableArea>
        </Modal>



        <Modal animationType="slide" visible={verifyModalVisible}  onRequestClose={() => {setVerifyModalVisible(!verifyModalVisible)}}>
            <ViewableArea>
                <Header text='Verify Email'/>
                <ContentContainer>
                    <View style={styles.container}>
                        <Text category='s1'>Enter verification code:</Text>
                        <Input
                            placeholder = 'Code'
                            value={verificationCode}
                            onChangeText={nextValue => setVerificationCode(nextValue.replace(/[^0-9]/g, ''))}
                            caption={
                                verificationError &&
                                <Text style={styles.errorMsg}>
                                    Failed to verify email. Code may be incorrect or expired.
                                </Text>
                            }
                            keyboardType='number-pad'
                        />

                        <Button
                            status={'success'}
                            style={styles.submitButton}
                            onPress={() => verifyEmail()}
                            accessoryRight = {confirmIcon}
                        >
                            SUBMIT
                        </Button>

                        <View style={styles.buttonRow}>
                            <Button
                                status={'danger'}
                                onPress={() => {
                                    setVerificationCode('')
                                    setVerificationError(false)
                                    setVerifyModalVisible(!verifyModalVisible)
                                }}
                                accessoryLeft = {closeIcon}
                            >
                                CANCEL
                            </Button>
                            <Button
                                onPress={() => resendCode()}
                            >
                                RESEND CODE
                            </Button>
                        </View>

                        {
                            codeChanged &&
                            <Text>
                                Sent a new verification code to your email. Please check your inbox and spam folder.
                            </Text>
                        }
                    </View>
                </ContentContainer>
            </ViewableArea>
        </Modal>

        <ScrollView style={styles.settingsContainer}>

          <View style={styles.circle}>
            <Text style={styles.userInitials}>
              {props.firstName && props.firstName[0]}{props.lastName && props.lastName[0]}
            </Text>
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.details}> {props.firstName} {props.lastName} </Text>
            <Text style={styles.details}> {props.email.charAt(0).toUpperCase() + props.email.slice(1)} </Text>
          </View>

          <Button style={styles.button} onPress={() => setSettingsModalVisible(!settingsModalVisible)} accessoryRight = {editIcon}>
            EDIT PROFILE
          </Button>

          <Button style={styles.button} onPress={themeContext.toggleTheme} accessoryRight = {themeIcon}>
            TOGGLE THEME
          </Button>

          {
              !isVerified &&
              <Button style={styles.button} onPress={() => setVerifyModalVisible(!verifyModalVisible)}>
                VERIFY EMAIL
              </Button>
          }

          <Button style={styles.button} onPress={launchFaq} accessoryRight={faqIcon}>
            FAQ
          </Button>

          <MapConfigButtonGroup/>

          <Button style={styles.logOutButton} status='danger' onPress={() => setLogoutVisible(true)}>
            LOG OUT
          </Button>

          <PopUpContainer
            visible={logoutVisible}
            closePopUp={() => setLogoutVisible(false)}
            >
              <View>
                <Text style={styles.logOutText}>
                  Are you sure you want to log out?
                </Text>

                <View style={{flexDirection: 'row', justifyContent:'space-around'}}>
                  <Button style={styles.logOutButtonPrompt} appearance={'outline'} onPress={() => logOut()}>Yes</Button>
                  <Button style={styles.logOutButtonPrompt} appearance={'outline'} onPress={() => setLogoutVisible(false)}>No</Button>
                </View>

              </View>
          </PopUpContainer>

        </ScrollView>

      </ContentContainer>
    </ViewableArea>
    );
};

const logoutIcon = (props) => (
  <Icon {...props} fill='white' name='log-out-outline'/>
);
