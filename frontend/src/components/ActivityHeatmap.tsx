import React from 'react';

interface ActivityData {
    date: string;
    count: number;
}

interface ActivityHeatmapProps {
    activities: ActivityData[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ activities }) => {
    // Generate last 90 days (3 months)
    const generateDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }
        return days;
    };

    const days = generateDays();
    
    // Create a map of date -> count
    const activityMap = new Map<string, number>();
    activities.forEach(activity => {
        const dateStr = activity.date.split('T')[0];
        activityMap.set(dateStr, activity.count);
    });

    // Get color based on activity count
    const getColor = (count: number) => {
        if (count === 0) return 'bg-slate-100';
        if (count === 1) return 'bg-green-200';
        if (count === 2) return 'bg-green-400';
        if (count >= 3) return 'bg-green-600';
        return 'bg-green-800';
    };

    // Group days by week
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Start from the first day's day of week
    const firstDayOfWeek = days[0].getDay();
    // Add empty days to align the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(new Date(0)); // placeholder
    }
    
    days.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    });
    
    // Add remaining days
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(new Date(0)); // placeholder
        }
        weeks.push(currentWeek);
    }

    // Get month labels
    const getMonthLabel = (weekIndex: number) => {
        if (weekIndex >= weeks.length) return '';
        const week = weeks[weekIndex];
        const firstRealDay = week.find(d => d.getTime() !== 0);
        if (firstRealDay && firstRealDay.getDate() <= 7) {
            return firstRealDay.toLocaleDateString('ru-RU', { month: 'short' });
        }
        return '';
    };

    const totalActivities = activities.reduce((sum, a) => sum + a.count, 0);
    const daysWithActivity = activities.filter(a => a.count > 0).length;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                    {totalActivities} активностей за последние 3 месяца
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Меньше</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-200"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                    </div>
                    <span>Больше</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-flex flex-col gap-1">
                    {/* Month labels */}
                    <div className="flex gap-1 mb-2 ml-8">
                        {weeks.map((_, weekIndex) => (
                            <div key={weekIndex} className="w-3 text-xs text-slate-500">
                                {getMonthLabel(weekIndex)}
                            </div>
                        ))}
                    </div>

                    {/* Day labels and grid */}
                    <div className="flex gap-2">
                        {/* Day of week labels */}
                        <div className="flex flex-col gap-1 text-xs text-slate-500 justify-around">
                            <div className="h-3">Пн</div>
                            <div className="h-3"></div>
                            <div className="h-3">Ср</div>
                            <div className="h-3"></div>
                            <div className="h-3">Пт</div>
                            <div className="h-3"></div>
                            <div className="h-3">Вс</div>
                        </div>

                        {/* Activity grid */}
                        <div className="flex gap-1">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {week.map((day, dayIndex) => {
                                        if (day.getTime() === 0) {
                                            return <div key={dayIndex} className="w-3 h-3"></div>;
                                        }
                                        
                                        const dateStr = day.toISOString().split('T')[0];
                                        const count = activityMap.get(dateStr) || 0;
                                        const color = getColor(count);
                                        
                                        return (
                                            <div
                                                key={dayIndex}
                                                className={`w-3 h-3 rounded-sm ${color} hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer`}
                                                title={`${dateStr}: ${count} активностей`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-sm text-slate-600">
                Активных дней: {daysWithActivity} из 90
            </div>
        </div>
    );
};
