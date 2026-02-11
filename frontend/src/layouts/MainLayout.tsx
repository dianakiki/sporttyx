import React from 'react';
import { Header } from '../components/Header';

interface MainLayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, showHeader = true }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {showHeader && <Header />}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};
