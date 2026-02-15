export const ADMIN_EMAILS = [
    'mgowthamanai2305@gmail.com'
];

export const isAdmin = (email: string | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
};
