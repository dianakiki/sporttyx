export const mockUser = {
  id: 1,
  username: "demo_user",
  email: "demo@sporttyx.com",
  firstName: "Демо",
  lastName: "Пользователь",
  dateOfBirth: "1990-01-01",
  gender: "MALE",
  city: "Москва",
  photoUrl: "https://i.pravatar.cc/300?img=1",
  role: "USER",
  teamId: 1,
  points: 1250,
  createdAt: "2024-01-01T00:00:00"
};

export const mockTeams = [
  {
    id: 1,
    name: "Спортивные Энтузиасты",
    description: "Команда любителей активного образа жизни",
    photoUrl: "https://picsum.photos/seed/team1/400/300",
    captainId: 1,
    totalPoints: 5420,
    memberCount: 8,
    createdAt: "2024-01-01T00:00:00"
  },
  {
    id: 2,
    name: "Бегуны Города",
    description: "Мы любим бегать по утрам",
    photoUrl: "https://picsum.photos/seed/team2/400/300",
    captainId: 5,
    totalPoints: 4890,
    memberCount: 6,
    createdAt: "2024-01-15T00:00:00"
  },
  {
    id: 3,
    name: "Велосипедисты",
    description: "Покоряем дороги на двух колесах",
    photoUrl: "https://picsum.photos/seed/team3/400/300",
    captainId: 10,
    totalPoints: 3200,
    memberCount: 5,
    createdAt: "2024-02-01T00:00:00"
  }
];

export const mockActivities = [
  {
    id: 1,
    participantId: 1,
    teamId: 1,
    activityType: "RUNNING",
    distance: 5.2,
    duration: 32,
    date: "2024-02-20T08:00:00",
    description: "Утренняя пробежка в парке",
    photoUrls: ["https://picsum.photos/seed/run1/800/600"],
    points: 52,
    status: "APPROVED",
    participant: mockUser,
    reactions: [
      { id: 1, participantId: 2, reactionType: "LIKE" },
      { id: 2, participantId: 3, reactionType: "FIRE" }
    ],
    comments: [
      {
        id: 1,
        participantId: 2,
        text: "Отличный результат!",
        createdAt: "2024-02-20T09:00:00",
        participant: {
          id: 2,
          username: "runner_pro",
          firstName: "Алексей",
          lastName: "Иванов",
          photoUrl: "https://i.pravatar.cc/150?img=2"
        }
      }
    ]
  },
  {
    id: 2,
    participantId: 1,
    teamId: 1,
    activityType: "CYCLING",
    distance: 25.5,
    duration: 90,
    date: "2024-02-19T17:00:00",
    description: "Велопрогулка по набережной",
    photoUrls: ["https://picsum.photos/seed/bike1/800/600", "https://picsum.photos/seed/bike2/800/600"],
    points: 128,
    status: "APPROVED",
    participant: mockUser,
    reactions: [
      { id: 3, participantId: 4, reactionType: "LIKE" }
    ],
    comments: []
  },
  {
    id: 3,
    participantId: 3,
    teamId: 1,
    activityType: "SWIMMING",
    distance: 1.5,
    duration: 45,
    date: "2024-02-18T19:00:00",
    description: "Плавание в бассейне",
    photoUrls: ["https://picsum.photos/seed/swim1/800/600"],
    points: 75,
    status: "APPROVED",
    participant: {
      id: 3,
      username: "swimmer_girl",
      firstName: "Мария",
      lastName: "Петрова",
      photoUrl: "https://i.pravatar.cc/150?img=5"
    },
    reactions: [],
    comments: []
  }
];

export const mockEvents = [
  {
    id: 1,
    name: "Весенний Марафон 2024",
    description: "Ежегодный марафон для всех желающих",
    startDate: "2024-03-15T09:00:00",
    endDate: "2024-03-15T15:00:00",
    location: "Центральный парк",
    maxParticipants: 100,
    currentParticipants: 45,
    photoUrl: "https://picsum.photos/seed/event1/800/400",
    status: "UPCOMING",
    createdBy: 1,
    activityTypes: ["RUNNING"],
    minDistance: 5.0,
    bonusPoints: 100
  },
  {
    id: 2,
    name: "Велогонка по городу",
    description: "Соревнование среди велосипедистов",
    startDate: "2024-04-01T10:00:00",
    endDate: "2024-04-01T14:00:00",
    location: "Городская набережная",
    maxParticipants: 50,
    currentParticipants: 28,
    photoUrl: "https://picsum.photos/seed/event2/800/400",
    status: "UPCOMING",
    createdBy: 1,
    activityTypes: ["CYCLING"],
    minDistance: 20.0,
    bonusPoints: 150
  }
];

export const mockNotifications = [
  {
    id: 1,
    participantId: 1,
    type: "ACTIVITY_APPROVED",
    message: "Ваша активность 'Утренняя пробежка' была одобрена",
    relatedEntityId: 1,
    relatedEntityType: "ACTIVITY",
    isRead: false,
    createdAt: "2024-02-20T10:00:00"
  },
  {
    id: 2,
    participantId: 1,
    type: "NEW_COMMENT",
    message: "Алексей Иванов прокомментировал вашу активность",
    relatedEntityId: 1,
    relatedEntityType: "ACTIVITY",
    isRead: false,
    createdAt: "2024-02-20T09:00:00"
  },
  {
    id: 3,
    participantId: 1,
    type: "EVENT_REMINDER",
    message: "Напоминание: 'Весенний Марафон 2024' начнется через 3 дня",
    relatedEntityId: 1,
    relatedEntityType: "EVENT",
    isRead: true,
    createdAt: "2024-02-12T12:00:00"
  }
];

export const mockTeamMembers = [
  {
    id: 1,
    username: "demo_user",
    firstName: "Демо",
    lastName: "Пользователь",
    photoUrl: "https://i.pravatar.cc/150?img=1",
    points: 1250,
    role: "CAPTAIN"
  },
  {
    id: 2,
    username: "runner_pro",
    firstName: "Алексей",
    lastName: "Иванов",
    photoUrl: "https://i.pravatar.cc/150?img=2",
    points: 980,
    role: "MEMBER"
  },
  {
    id: 3,
    username: "swimmer_girl",
    firstName: "Мария",
    lastName: "Петрова",
    photoUrl: "https://i.pravatar.cc/150?img=5",
    points: 850,
    role: "MEMBER"
  },
  {
    id: 4,
    username: "cyclist_max",
    firstName: "Максим",
    lastName: "Сидоров",
    photoUrl: "https://i.pravatar.cc/150?img=8",
    points: 720,
    role: "MEMBER"
  }
];

export const mockActivityTypes = [
  { value: "RUNNING", label: "Бег", points: 10 },
  { value: "CYCLING", label: "Велосипед", points: 5 },
  { value: "SWIMMING", label: "Плавание", points: 50 },
  { value: "WALKING", label: "Ходьба", points: 3 },
  { value: "GYM", label: "Тренажерный зал", points: 15 },
  { value: "YOGA", label: "Йога", points: 20 },
  { value: "FOOTBALL", label: "Футбол", points: 12 },
  { value: "BASKETBALL", label: "Баскетбол", points: 12 },
  { value: "VOLLEYBALL", label: "Волейбол", points: 12 },
  { value: "TENNIS", label: "Теннис", points: 15 }
];
