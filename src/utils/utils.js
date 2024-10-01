export function capitalize(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const getAuthenScreen = (currentUser) =>{
    if (!currentUser.birthday) {
        return 'BirthdayUpdateScreen'
    } else if (!currentUser.gender) {
        return 'GenderUpdateScreen'
    } else if (!currentUser.pronouns) {
        return 'PronounsUpdateScreen'
    } else if (!currentUser.avatar) {
        return 'AvatarUpdateScreen'
    } 

    return 'Dashboard'
}