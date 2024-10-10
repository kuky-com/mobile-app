export function capitalize(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const getAuthenScreen = (currentUser) =>{
    if (!currentUser?.full_name) {
        return 'NameUpdateScreen'
    } else if (!currentUser?.birthday) {
        return 'BirthdayUpdateScreen'
    } else if (!currentUser?.gender) {
        return 'GenderUpdateScreen'
    } else if (!currentUser?.pronouns) {
        return 'PronounsUpdateScreen'
    } else if (!currentUser?.avatar) {
        return 'AvatarUpdateScreen'
    } else if (!currentUser?.purposes || currentUser?.purposes.length === 0) {
        return 'PurposeUpdateScreen'
    } else if (!currentUser?.interests || currentUser?.interests.length === 0) {
        return 'ReviewProfileScreen'
    } else if (!currentUser?.profile_tag) {
        return 'ProfileTagScreen'
    }

    return 'Dashboard'
}