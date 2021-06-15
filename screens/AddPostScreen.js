import React, { useState, useContext, useEffect } from 'react'
import { StyleSheet, Text, View, Image, Alert, ActivityIndicator } from 'react-native'
import { AddImage, InputField, InputWrapper, StatusWrapper, SubmitBtn, SubmitBtnText, submitPost } from '../styles/AddPost';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';


const AddPostScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [userImg, setUserImg] = useState(null);
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);
    const [post, setPost] = useState(null);

    useEffect(() => {
        setUsername();
    }, []);

    const setUsername = async () => {
        console.log(user.uid);
        try {
            await firestore().collection('users').doc(user.uid).get().then(documentSnapshot => {

                if (documentSnapshot.exists) {
                    //console.log('data : ', documentSnapshot.data());
                    const { fname, lname, userImg } = documentSnapshot.data();
                    console.log(fname + " " + lname);
                    var name1 = fname + " " + lname;

                    setName(name1);
                    setUserImg(userImg);


                }
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    const opengallery = () => {
        ImagePicker.openPicker({
            width: 1200,
            height: 780,
            cropping: true
        }).then(image => {
            console.log(image);
            const imageUri = image.path;
            setImage(imageUri);
        });
    }

    const opencamera = () => {
        ImagePicker.openCamera({
            width: 1200,
            height: 780,
            cropping: true,
        }).then(image => {
            console.log(image);
            const imageUri = image.path;
            setImage(imageUri);
        });
    }
    const submitPost = async () => {
        const imageUrl = await uploadImage();
        console.log('Image Uri: ', imageUrl);

        firestore()
            .collection('posts')
            .add({
                userImg: userImg,
                userName: name,
                userId: user.uid,
                post: post,
                postImg: imageUrl,
                postTime: firestore.Timestamp.fromDate(new Date()),
                likes: 0,
                liked: false,
                comments: null,
            })
            .then(() => {
                console.log('Post Added!');
                Alert.alert(
                    'Post Published',
                    'Your post has been published successfully'
                );
                setPost(null);
                navigation.replace('RN Social');
            })
            .catch((error) => {
                console.log('Something went wrong!', error);
            })
    }


    const uploadImage = async () => {
        if (image == null) {
            return null;
        }
        const uploadUri = image;
        let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

        //Add timestamp to file name
        const extension = filename.split('.').pop();
        const name = filename.split('.').slice(0, -1).join('.');
        filename = name + Date.now() + '.' + extension;

        setUploading(true);
        setTransferred(0);
        const storageRef = storage().ref(`photos/${filename}`);
        const task = storageRef.putFile(uploadUri);
        //set transferred state
        task.on('state_changed', taskSnapshot => {
            console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);

            setTransferred(
                Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100,
            );
        });


        try {
            await task;

            const url = await storageRef.getDownloadURL();

            setUploading(false);

            return url;
        }
        catch (e) {
            console.log(e);
            return null;
        }
        setImage(null);

    }

    return (
        <View style={styles.container}>
            <InputWrapper>
                {image != null ? <AddImage source={{ uri: image }} /> : null}
                <InputField
                    placeholder="What's on your mind?"
                    multiLine
                    numberOfLine={4}
                    value={post}
                    onChangeText={(context) => setPost(context)}
                />

                {uploading ? (
                    <StatusWrapper>
                        <Text>{transferred} % Completed</Text>
                        <ActivityIndicator size='large' color='#0000ff' />
                    </StatusWrapper>
                ) : (
                    <SubmitBtn onPress={submitPost}>
                        <SubmitBtnText>Post</SubmitBtnText>
                    </SubmitBtn>

                )}


            </InputWrapper>
            <ActionButton buttonColor="#4B6ED6">
                <ActionButton.Item buttonColor='#9b59b6' title="Take Photo" onPress={() => opencamera()}>
                    <Icon name="camera-outline" style={styles.actionButtonIcon} />
                </ActionButton.Item>
                <ActionButton.Item buttonColor='#3498db' title="Choose Photo" onPress={() => opengallery()}>
                    <Icon name="md-images-outline" style={styles.actionButtonIcon} />
                </ActionButton.Item>
            </ActionButton>
        </View>
    )
}

export default AddPostScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
})
