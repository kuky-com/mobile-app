import { SendbirdCalls } from "@sendbird/calls-react-native";
import dayjs from "dayjs";
import { FFprobeKit } from "ffmpeg-kit-react-native";
import { Platform } from "react-native";

export function capitalize(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const getStatusColor = (status = '') => {
    switch (status?.toLowerCase()) {
        case 'away':
            return '#FFD322';
        case 'active':
            return '#2EE62A';
        default:
            return '#A7A7A7';
    }
}

export const getUnit = (unit) => {
    return Platform.isPad ? (unit * 1.2) : unit
}

export const getAuthenScreen = (currentUser, fromRecording = false) => {
    // if (!currentUser?.full_name) {
    //     return 'NameUpdateScreen'
    // } else if (!currentUser?.video_intro && !skipVideo) {
    //     // return 'RegisterSuccessScreen'
    //     return 'OnboardingVideoTutorialScreen'
    //     // return 'OnboardingSampleProfileScreen'
    // } else if (!currentUser?.purposes || currentUser?.purposes.length === 0 || !currentUser?.interests || currentUser?.interests.length === 0) {
    //     return 'OnboardingReviewProfileScreen'
    // } else if (!currentUser?.profile_tag) {
    //     return 'ProfileTagScreen'
    // }

    if (!currentUser?.full_name) {
        return 'NameUpdateScreen'
    } 
    // else if (!currentUser?.journey_category_id) {
    //     return 'ReferralUpdateScreen'
    // } else if (!currentUser?.journey_id) {
    //     return 'StruggleSelectionScreen'
    // } 
    else if (!currentUser?.avatar) {
        return 'AvatarUpdateScreen'
    } else if (!currentUser?.video_intro) {
        return 'IntroductionVideoTutorialScreen'
    } else if (!currentUser?.video_purpose) {
        return 'JourneyVideoTutorialScreen'
    } else if(!currentUser?.journey_category_id || !currentUser?.journey_id) {
        return 'JourneyMatchingScreen'
    } else if (currentUser?.askJPFGeneral) {
        return 'GeneralJPFScreen'
    } else if (currentUser?.askJPFSpecific) {
        return 'SpecificJPFScreen'
    }
    // else if (!currentUser?.birthday || !currentUser?.gender || !currentUser?.pronouns || !currentUser?.location || ((currentUser?.likeCount ?? 0) === 0)) {
    //     return 'AskUpdateInfoScreen'
    // }
    // else if (!currentUser?.video_intro || !currentUser?.video_why || !currentUser?.video_challenge
    //     || !currentUser?.video_purpose || !currentUser?.video_interests
    // ) {
    //     if (fromRecording) {
    //         return 'VideoIntroductionScreen'
    //     } else {
    //         return 'OnboardingVideoTutorialScreen'
    //     }
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

export const naturalJoin = (arr) => {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr.join(' and ');
    return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
}

export const formatCallSeconds = (milliseconds) => {
    const durationObj = dayjs.duration(milliseconds, 'milliseconds');

    const hours = Math.floor(durationObj.asHours()); // Use asHours() to handle durations > 24 hours
    const minutes = durationObj.minutes();
    const seconds = durationObj.seconds();

    const parts = [];
    if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (seconds || (!hours && !minutes)) {
        parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
    }

    return parts.join(', ');
};

export const formatSeconds = (secondsNumber) => {
    const durationObj = dayjs.duration(secondsNumber, 'seconds');

    const hours = Math.floor(durationObj.asHours()); // Use asHours() to handle durations > 24 hours
    const minutes = durationObj.minutes();
    const seconds = durationObj.seconds();

    const parts = [];
    if (hours) parts.push(`${hours} h`);
    if (minutes) parts.push(`${minutes} m`);
    if (seconds || (!hours && !minutes)) {
        parts.push(`${seconds} s`);
    }

    return parts.join(', ');
};

export const parseFormattedCallSeconds = (formattedString) => {
    const timeUnits = {
        hour: 3600 * 1000,
        minute: 60 * 1000,
        second: 1000,
    };

    return formattedString.split(', ').reduce((totalMilliseconds, part) => {
        const [value, unit] = part.split(' ');
        const singularUnit = unit.replace(/s$/, ''); // Remove plural 's' if present
        return totalMilliseconds + (parseInt(value, 10) * (timeUnits[singularUnit] || 0));
    }, 0);
};

export function isStringInteger(value) {
    return (Number.isInteger(value) || (typeof value === 'string' && Number.isInteger(Number(value))));
}


export const DEFAULT_PURPOSES = [
    'Find support for anxiety',
    'Cope with depression',
    'Build confidence',
    'Navigate a divorce or breakup',
    'Overcome grief or loss',
    'Manage stress better',
    'Create healthier habits',
    'Improve work-life balance',
    'Learn mindfulness techniques',
    'Connect with others facing similar challenges',
]

export const DEFAULT_LIKES = [
    'Reading',
    'Writing or journaling',
    'Painting or drawing',
    'Cooking or baking',
    'Playing musical instruments',
    'Listening to music',
    'Watching movies or TV shows',
    'Hiking or nature walks',
    'Gardening',
    'Fitness or working out',
    'Yoga or meditation',
    'Gaming',
    'Traveling',
    'Photography',
    'Crafting or DIY projects',
    'Dancing'
]

export const DEFAULT_DISLIKES = [
    'Crowded places',
    'Loud noises',
    'Socializing with strangers',
    'Conflict or arguments',
    'Public speaking',
    'Unstructured routines',
    'Being alone for extended periods',
    'Lack of support',
    'Feeling judged',
    'Overwhelming tasks',
    'Poor communication',
    'Toxic relationships',
    'Excessive screen time',
]