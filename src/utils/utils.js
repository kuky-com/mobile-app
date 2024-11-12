import { Platform } from "react-native";

export function capitalize(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const getUnit = (unit) => {
    return Platform.isPad ? (unit * 1.2) : unit
}

export const getAuthenScreen = (currentUser, exclude = 'AvatarUpdateScreen') =>{
    if (!currentUser?.full_name) {
        return 'NameUpdateScreen'
    } else if (!currentUser?.video_intro) {
        return 'OnboardingVideoTutorialScreen'
    } else if (!currentUser?.purposes || currentUser?.purposes.length === 0 || !currentUser?.interests || currentUser?.interests.length === 0) {
        return 'ReviewProfileScreen'
    } else if (!currentUser?.profile_tag) {
        return 'ProfileTagScreen'
    }

    // if (!currentUser?.full_name) {
    //     return 'NameUpdateScreen'
    // } else if (!currentUser?.birthday) {
    //     return 'BirthdayUpdateScreen'
    // } else if (!currentUser?.gender) {
    //     return 'GenderUpdateScreen'
    // } else if (!currentUser?.pronouns) {
    //     return 'PronounsUpdateScreen'
    // }  else if (!currentUser?.avatar && exclude !== 'AvatarUpdateScreen') {
    //     return 'AvatarUpdateScreen'
    // } else if (!currentUser?.purposes || currentUser?.purposes.length === 0) {
    //     return 'PurposeUpdateScreen'
    // } else if (!currentUser?.interests || currentUser?.interests.length === 0) {
    //     return 'ReviewProfileScreen'
    // // } else if (!currentUser?.video_intro) {
    // //     return 'OnboardingVideoIntroScreen'
    // // } else if (!currentUser?.video_purpose) {
    // //     return 'OnboardingVideoPurposeScreen'
    // } else if (!currentUser?.profile_tag) {
    //     return 'ProfileTagScreen'
    // }

    return 'Dashboard'
}