# Документация: customScoringRules

## Описание

`customScoringRules` - это JSON-поле в сущности Event, которое позволяет настраивать гибкие правила подсчета баллов для каждого мероприятия индивидуально.

## Структура JSON

### Полная структура с примерами

```json
{
  "activityTypeMultipliers": {
    "Бег": 1.5,
    "Плавание": 2.0,
    "Йога": 0.8,
    "Велосипед": 1.3
  },
  "bonuses": [
    {
      "id": "streak_7days",
      "type": "streak",
      "name": "Неделя без перерыва",
      "description": "Бонус за 7 дней активности подряд",
      "condition": {
        "consecutiveDays": 7
      },
      "reward": {
        "type": "multiplier",
        "value": 1.2
      }
    },
    {
      "id": "milestone_1000",
      "type": "milestone",
      "name": "Первая тысяча",
      "description": "Бонус за достижение 1000 баллов",
      "condition": {
        "totalPoints": 1000
      },
      "reward": {
        "type": "fixed",
        "value": 500
      }
    },
    {
      "id": "daily_goal",
      "type": "daily",
      "name": "Дневная цель",
      "description": "Бонус за выполнение дневной нормы",
      "condition": {
        "dailyPoints": 100
      },
      "reward": {
        "type": "percentage",
        "value": 10
      }
    }
  ],
  "penalties": [
    {
      "id": "inactivity_3days",
      "type": "inactivity",
      "name": "Штраф за неактивность",
      "description": "Штраф за 3 дня без активности",
      "condition": {
        "inactiveDays": 3
      },
      "penalty": {
        "type": "percentage",
        "value": 10
      }
    }
  ],
  "teamBonuses": {
    "allMembersActive": {
      "name": "Вся команда в деле",
      "description": "Все члены команды активны в течение дня",
      "multiplier": 1.1
    },
    "teamMilestone": {
      "name": "Командная цель",
      "description": "Команда достигла 5000 баллов",
      "threshold": 5000,
      "reward": 1000
    }
  },
  "timeBasedMultipliers": {
    "weekends": {
      "name": "Выходные",
      "description": "Повышенные баллы в выходные",
      "multiplier": 1.3,
      "daysOfWeek": [6, 7]
    },
    "earlyBird": {
      "name": "Ранняя пташка",
      "description": "Активность до 8 утра",
      "multiplier": 1.2,
      "timeRange": {
        "start": "06:00",
        "end": "08:00"
      }
    }
  }
}
```

## Описание полей

### 1. activityTypeMultipliers
**Тип:** Object  
**Назначение:** Множители баллов для разных типов активностей

**Пример:**
```json
{
  "Бег": 1.5,      // Бег дает в 1.5 раза больше баллов
  "Плавание": 2.0, // Плавание дает в 2 раза больше баллов
  "Йога": 0.8      // Йога дает на 20% меньше баллов
}
```

### 2. bonuses
**Тип:** Array  
**Назначение:** Бонусы за достижения

**Типы бонусов:**

#### a) Streak (Серия)
Бонус за последовательные дни активности
```json
{
  "type": "streak",
  "condition": {
    "consecutiveDays": 7  // Количество дней подряд
  },
  "reward": {
    "type": "multiplier", // или "fixed", "percentage"
    "value": 1.2          // 20% бонус ко всем баллам
  }
}
```

#### b) Milestone (Веха)
Бонус за достижение определенного количества баллов
```json
{
  "type": "milestone",
  "condition": {
    "totalPoints": 1000   // Порог баллов
  },
  "reward": {
    "type": "fixed",      // Фиксированная награда
    "value": 500          // +500 баллов
  }
}
```

#### c) Daily (Ежедневный)
Бонус за выполнение дневной нормы
```json
{
  "type": "daily",
  "condition": {
    "dailyPoints": 100    // Дневная норма
  },
  "reward": {
    "type": "percentage", // Процент от дневных баллов
    "value": 10           // +10% к дневным баллам
  }
}
```

### 3. penalties
**Тип:** Array  
**Назначение:** Штрафы за неактивность или нарушения

**Пример:**
```json
{
  "type": "inactivity",
  "condition": {
    "inactiveDays": 3     // 3 дня без активности
  },
  "penalty": {
    "type": "percentage", // Процент от общих баллов
    "value": 10           // -10% от общих баллов
  }
}
```

### 4. teamBonuses
**Тип:** Object  
**Назначение:** Бонусы для команд

**Примеры:**
```json
{
  "allMembersActive": {
    "multiplier": 1.1     // +10% если все члены команды активны
  },
  "teamMilestone": {
    "threshold": 5000,    // Порог командных баллов
    "reward": 1000        // Бонус команде
  }
}
```

### 5. timeBasedMultipliers
**Тип:** Object  
**Назначение:** Множители в зависимости от времени

**Примеры:**
```json
{
  "weekends": {
    "multiplier": 1.3,
    "daysOfWeek": [6, 7]  // Суббота и воскресенье
  },
  "earlyBird": {
    "multiplier": 1.2,
    "timeRange": {
      "start": "06:00",
      "end": "08:00"
    }
  }
}
```

## Логика применения

### Порядок расчета баллов:

1. **Базовые баллы** = `activity.energy`
2. **Применение множителя типа активности** (если есть в `activityTypeMultipliers`)
3. **Применение временных множителей** (если активность попадает в timeRange)
4. **Применение бонусов** (streak, milestone, daily)
5. **Применение командных бонусов** (если применимо)
6. **Применение общего множителя мероприятия** (`event.pointsMultiplier`)
7. **Применение штрафов** (если есть условия)

### Пример расчета:

```
Активность: Бег, 100 базовых баллов
Время: Суббота, 07:00

1. Базовые баллы: 100
2. Множитель типа (Бег x1.5): 100 * 1.5 = 150
3. Выходной день (x1.3): 150 * 1.3 = 195
4. Ранняя пташка (x1.2): 195 * 1.2 = 234
5. Серия 7 дней (x1.2): 234 * 1.2 = 280.8
6. Множитель мероприятия (x1.0): 280.8 * 1.0 = 280.8
7. Итого: 281 балл
```

## Как настроить

### Вариант 1: Через админ-панель (текущий способ)

1. Откройте админ-панель
2. Перейдите на вкладку "Мероприятия"
3. При создании мероприятия оставьте поле "Кастомные правила" пустым (будет использоваться стандартный подсчет)
4. Или вставьте JSON с правилами вручную

### Вариант 2: Через API

```bash
POST /api/admin/events
{
  "name": "Семейное соревнование",
  "customScoringRules": "{\"activityTypeMultipliers\":{\"Бег\":1.5}}"
}
```

### Вариант 3: Визуальный конструктор (будущая функция)

Планируется добавить визуальный интерфейс для настройки правил без необходимости писать JSON вручную.

## Примеры использования

### Пример 1: Простое мероприятие с повышенными баллами за бег

```json
{
  "activityTypeMultipliers": {
    "Бег": 1.5
  }
}
```

### Пример 2: Мероприятие с бонусами за регулярность

```json
{
  "bonuses": [
    {
      "type": "streak",
      "name": "Неделя без перерыва",
      "condition": { "consecutiveDays": 7 },
      "reward": { "type": "multiplier", "value": 1.2 }
    }
  ]
}
```

### Пример 3: Семейное мероприятие с командными бонусами

```json
{
  "teamBonuses": {
    "allMembersActive": {
      "name": "Вся семья в деле",
      "description": "Все члены семьи активны сегодня",
      "multiplier": 1.15
    }
  },
  "timeBasedMultipliers": {
    "weekends": {
      "name": "Семейные выходные",
      "multiplier": 1.3,
      "daysOfWeek": [6, 7]
    }
  }
}
```

## Валидация

При сохранении мероприятия JSON проходит валидацию:

- ✅ Корректный JSON формат
- ✅ Все множители > 0
- ✅ Все пороги (thresholds) > 0
- ✅ Корректные типы наград (multiplier, fixed, percentage)
- ✅ Корректные дни недели (1-7)
- ✅ Корректный формат времени (HH:MM)

## Будущие улучшения

1. **Визуальный конструктор правил** - drag-and-drop интерфейс
2. **Шаблоны правил** - готовые наборы для разных типов мероприятий
3. **Предпросмотр расчета** - калькулятор для проверки правил
4. **История изменений** - отслеживание изменений правил
5. **A/B тестирование** - сравнение эффективности разных правил

## Техническая реализация

### Backend (Java)

```java
// В ActivityService
public Integer calculatePoints(Activity activity, Event event) {
    Integer points = activity.getEnergy();
    
    if (event.getCustomScoringRules() != null) {
        JSONObject rules = new JSONObject(event.getCustomScoringRules());
        points = applyCustomRules(activity, rules, points);
    }
    
    return (int)(points * event.getPointsMultiplier());
}
```

### Frontend (React)

```typescript
// Компонент для визуального редактирования правил (будущая функция)
<ScoringRulesEditor 
  value={customScoringRules}
  onChange={setCustomScoringRules}
/>
```

## Поддержка

При возникновении вопросов или проблем с настройкой правил обращайтесь к администратору системы.
