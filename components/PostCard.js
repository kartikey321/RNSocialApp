import React, { useContext, useState } from 'react';
import { TouchableOpacity, Modal, View, Image } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { AuthContext } from '../navigation/AuthProvider';
import ProgressiveImage from "../components/ProgressiveImage";
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import { windowWidth } from '../utils/Dimensions';
import { Container, Card, UserInfo, UserImg, Divider, UserName, UserInfoText, PostTime, PostText, PostImg, InteractionWrapper, Interaction, InteractionText } from "../styles/FeedStyles";


const PostCard = ({ item, onDelete, onPress }) => {
    const [modalOpen, setModelOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    var likeIcon = item.liked ? 'heart' : 'heart-outline';
    var likeIconColor = item.liked ? '#2e64e5' : '#333';
    var likeText = '';
    var commentText = '';

    if (item.likes == 1) {
        likeText = '1 Like';
    } else if (item.likes > 1) {
        likeText = item.likes + ' Likes';
    } else {
        likeText = 'Like';
    }

    if (item.comments == 1) {
        commentText = '1 Comment';
    } else if (item.likes > 1) {
        commentText = item.likes + ' Comments';
    } else {
        commentText = 'Comment';
    }

    const updateLikes = () => {
        if (item.liked == false) {
            firestore()
                .collection('posts')
                .doc(item.id)
                .update({
                    liked: true,
                    likes: item.likes + 1,
                })
                .then(() => {
                    console.log('User updated!');
                    item.likes = item.likes + 1;
                    item.liked = true;
                });
        }
        else if (item.liked == true) {
            firestore()
                .collection('posts')
                .doc(item.id)
                .update({
                    liked: false,
                    likes: item.likes - 1,
                })
                .then(() => {
                    console.log('User updated!');
                    item.likes = item.likes - 1;
                    item.liked = false;
                });
        }
    }

    return (
        <View>
            <Modal visible={modalOpen}>
                <Card>
                    <View style={{ left: 0.9 * windowWidth }}>
                        <MaterialIcons name='cancel' size={35} color='black' onPress={() => setModelOpen(false)} />
                    </View>
                    <ProgressiveImage
                        defaultImageSource={require('../assets/default-img.jpg')}
                        source={{ uri: item.postImg }}
                        style={{ width: windowWidth, height: 350 }}
                        resizeMode="cover"
                        onPress={() => { }}
                    />
                </Card>

            </Modal>
            <Card>
                <UserInfo>
                    <UserImg source={{ uri: item.userImg }} />
                    <UserInfoText>
                        <TouchableOpacity onPress={onPress}>
                            <UserName>{item.userName}</UserName>
                        </TouchableOpacity>
                        <PostTime>{moment(item.postTime.toDate()).fromNow()}</PostTime>
                    </UserInfoText>
                </UserInfo>
                <PostText>{item.post}</PostText>
                {item.postImg != null ? (
                    <ProgressiveImage
                        defaultImageSource={require('../assets/default-img.jpg')}
                        source={{ uri: item.postImg }}
                        style={{ width: .8 * windowWidth, height: 310 }}
                        resizeMode="cover"
                        onPress={() => setModelOpen(true)}
                    />
                ) : (
                    <Divider />
                )}
                <InteractionWrapper>
                    <Interaction active={item.liked}>
                        <Icon name={likeIcon} size={25} color={likeIconColor} onPress={() => updateLikes()} />
                        <InteractionText active={item.liked}>{likeText}</InteractionText>
                    </Interaction>
                    <Interaction>
                        <Icon name="md-chatbubble-outline" size={25} />
                        <InteractionText>{commentText}</InteractionText>
                    </Interaction>
                    {user.uid == item.userId ?
                        <Interaction onPress={() => onDelete(item.id)} >
                            <Icon name="md-trash-bin" size={25} />
                        </Interaction>

                        : null}
                </InteractionWrapper>
            </Card>
        </View>
    );
};

export default PostCard;
