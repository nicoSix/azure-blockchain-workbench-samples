export const getRoleFromRoleId = roleId => {
    switch(roleId) {
        case 4: 
            return 'Owner';

        case 1: 
            return 'Initiating Counterparty';
        
        case 2:
            return 'Counterparty';

        case 3:
            return 'Device';

        case 5:
            return 'Observer';

        default:
            return 'Unknown role';
    }
};