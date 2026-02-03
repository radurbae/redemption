import TopNav from './TopNav';
import BottomNav from './BottomNav';

interface AppShellProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export default function AppShell({ children, showNav = true }: AppShellProps) {
    return (
        <div
            className="min-h-screen"
            style={{ background: 'var(--background)' }}
        >
            {showNav && <TopNav />}

            <main
                className={`
          w-full mx-auto px-4
          max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl
          ${showNav ? 'pt-4 md:pt-20 pb-24 md:pb-8' : 'pt-4 pb-8'}
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
