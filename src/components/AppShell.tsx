import TopNav from './TopNav';
import BottomNav from './BottomNav';

interface AppShellProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export default function AppShell({ children, showNav = true }: AppShellProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {showNav && <TopNav />}

            <main
                className={`
          w-full max-w-md mx-auto px-4 
          md:max-w-lg lg:max-w-xl
          ${showNav ? 'pt-4 md:pt-20 pb-bottom-nav md:pb-8' : 'pt-4 pb-8'}
        `}
                style={{
                    paddingTop: showNav ? undefined : 'max(1rem, env(safe-area-inset-top, 0px))',
                }}
            >
                {children}
            </main>

            {showNav && <BottomNav />}
        </div>
    );
}
