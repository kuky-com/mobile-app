import { FFprobeKit } from "ffmpeg-kit-react-native";
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
        // return 'OnboardingVideoTutorialScreen'
        return 'OnboardingSampleProfile'
    } else if (!currentUser?.purposes || currentUser?.purposes.length === 0 || !currentUser?.interests || currentUser?.interests.length === 0) {
        return 'OnboardingReviewProfileScreen'
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
    //     return 'OnboardingReviewProfileScreen'
    // // } else if (!currentUser?.video_intro) {
    // //     return 'OnboardingVideoIntroScreen'
    // // } else if (!currentUser?.video_purpose) {
    // //     return 'OnboardingVideoPurposeScreen'
    // } else if (!currentUser?.profile_tag) {
    //     return 'ProfileTagScreen'
    // }

    return 'Dashboard'
}

export const getVideoResizeDimensions = async (filePath) => {
    const command = `-v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`;
    return new Promise((resolve, reject) => {
        FFprobeKit.execute(command).then(async (session) => {
            try {
                const returnCode = await session.getReturnCode();
                if (returnCode.isValueSuccess()) {
                    const output = await session.getAllLogsAsString();
                    const [width, height] = output.trim().split('x').map(Number);

                    const maxWidth = 1920;
                    const aspectRatio = height / width;
                    const newWidth = Math.min(width, maxWidth);
                    const newHeight = Math.round(newWidth * aspectRatio);
                    resolve({ width: newWidth, height: newHeight });
                } else {
                    reject('Failed to get video dimensions');
                }
            } catch (error) {
                reject('Failed to get video dimensions');
            }
        });
    });
};