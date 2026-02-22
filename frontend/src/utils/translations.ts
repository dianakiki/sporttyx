// Утилита для перевода статусов, ролей и других терминов на русский язык

export const translateStatus = (status: string): string => {
    const translations: { [key: string]: string } = {
        'DRAFT': 'Черновик',
        'ACTIVE': 'Активно',
        'COMPLETED': 'Завершено',
        'CANCELLED': 'Отменено',
        'PENDING': 'Ожидание',
        'APPROVED': 'Одобрено',
        'REJECTED': 'Отклонено'
    };
    return translations[status] || status;
};

export const translateRole = (role: string): string => {
    const translations: { [key: string]: string } = {
        'ADMIN': 'Администратор',
        'USER': 'Пользователь',
        'MODERATOR': 'Модератор',
        'CAPTAIN': 'Капитан',
        'PARTICIPANT': 'Участник'
    };
    return translations[role] || role;
};

export const translateDashboardType = (type: string): string => {
    const translations: { [key: string]: string } = {
        'RANKING': 'Рейтинг',
        'TRACKER': 'Трекер',
        'FEED': 'Лента',
        'SIMPLE_LIST': 'Список'
    };
    return translations[type] || type;
};

export const translateVisibility = (visibility: string): string => {
    const translations: { [key: string]: string } = {
        'PUBLIC': 'Публичное',
        'PRIVATE': 'Приватное',
        'HIDDEN': 'Скрытое'
    };
    return translations[visibility] || visibility;
};

export const translateTeamRole = (role: string): string => {
    const translations: { [key: string]: string } = {
        'CAPTAIN': 'Капитан',
        'PARTICIPANT': 'Участник',
        'MEMBER': 'Участник'
    };
    return translations[role] || role;
};
