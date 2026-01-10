'use client';

// =============================================================================
// TRVALE DO BOI - Componente Card de Estatísticas
// =============================================================================

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'red' | 'green' | 'blue' | 'orange';
}

export function StatCard({ title, value, icon, color = 'red' }: StatCardProps) {
    const colorClasses = {
        red: 'text-primary',
        green: 'text-green-600',
        blue: 'text-blue-600',
        orange: 'text-orange-500',
    };

    return (
        <div className="card-hover">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <p className={`text-4xl font-bold ${colorClasses[color]}`}>{value}</p>
                </div>
                <div className={`text-4xl ${colorClasses[color]} opacity-30`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// Componente de Grid para múltiplos cards
interface StatsGridProps {
    children: React.ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    );
}
