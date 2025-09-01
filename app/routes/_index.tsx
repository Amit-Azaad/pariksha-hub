import { useEffect, useState } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useRevalidator } from "@remix-run/react";
import SignInModal from "../components/auth/SignInModal";
import { useSignInModal } from "../hooks/useSignInModal";

export const meta: MetaFunction = () => [
  { title: "Exam Prep Platform" },
  { name: "description", content: "A PWA for exam aspirants to prepare for competitive exams." },
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get Prisma client
    const { prisma } = await import("../lib/prisma.server");
    
    const [exams, testSeries, notes, heroSections] = await Promise.all([
      prisma.exam.findMany({ orderBy: { id: "asc" }, take: 10 }),
      prisma.testSeries.findMany({ orderBy: { id: "asc" }, take: 10 }),
      prisma.note.findMany({ orderBy: { id: "asc" }, take: 10 }),
      prisma.heroSection.findMany({ orderBy: { id: "asc" } }),
    ]);

    // Get user from session
    let user = null;
    try {
      const { sessionStorage } = await import("../lib/oauth.server");
      const cookieHeader = request.headers.get("Cookie");
      const session = await sessionStorage.getSession(cookieHeader);
      const userId = session.get("userId");
      
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
        });
        
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            avatar: dbUser.avatar,
          };
        }
      }
    } catch (error) {
      console.error("Session error:", error);
    }

    return json(
      { exams, testSeries, notes, heroSections, user },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, private",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
    
  } catch (error) {
    console.error("Loader error:", error);
    return json({ 
      exams: [], 
      testSeries: [], 
      notes: [], 
      heroSections: [],
      user: null,
      error: "Failed to load data"
    });
  }
}

export default function Index() {
  const { exams, testSeries, notes, heroSections, user } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { isOpen, modalConfig, openModal, closeModal } = useSignInModal();
  const revalidator = useRevalidator();

  // Use server user directly - no client-side caching to avoid inconsistencies
  const displayUser = user;
  
  // Force revalidation when user state changes to ensure fresh data
  useEffect(() => {
    if (user === null) {
      // If user is null (logged out), force revalidation to ensure clean state
      revalidator.revalidate();
    }
  }, [user, revalidator]);

  // Carousel auto-advance
  useEffect(() => {
    if (heroSections.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSections.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroSections.length]);

  // Swipe functions
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setHeroIndex((prev) => (prev + 1) % heroSections.length);
    } else if (isRightSwipe) {
      setHeroIndex((prev) => (prev - 1 + heroSections.length) % heroSections.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
                <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-header)]">
          <div className="flex items-center justify-center w-10 h-10 bg-transparent hover:bg-[var(--color-interactive-hover)] dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <img 
            src="/images/LearnPlusFinalLogo.png" 
            alt="LEARN PLUS Logo" 
            className="w-10 h-10 object-contain"
          />
        </div>
        <div className="flex-1 mx-4 flex items-center">
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full border px-4 py-2 h-10 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link to="/notifications" aria-label="Notifications" className="flex items-center justify-center w-8 h-8 hover:bg-[var(--color-interactive-hover)] dark:hover:bg-white/20 rounded-lg transition-colors">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--color-text-primary)]">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
          
          {displayUser ? (
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              {displayUser.avatar && displayUser.avatar.trim() !== '' ? (
                <img
                  className="h-8 w-8 rounded-full border-2 border-gray-200 object-cover"
                  src={displayUser.avatar}
                  alt={displayUser.name || displayUser.email}
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback Avatar with Initials */}
              <div 
                className={`h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-gray-200 ${
                  displayUser.avatar && displayUser.avatar.trim() !== '' ? 'hidden' : ''
                }`}
              >
                <span className="text-white text-xs font-medium">
                  {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : displayUser.email.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* User Info (hidden on mobile) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {displayUser.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">{displayUser.email}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openModal()}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
          
          <button 
            className="flex items-center justify-center w-8 h-8 hover:bg-[var(--color-interactive-hover)] dark:hover:bg-white/20 rounded-lg transition-colors" 
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--color-text-primary)]">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-24">
        {/* Hero Section */}
        {heroSections.length > 0 && (
          <section className="mb-8 relative overflow-hidden rounded-xl">
            <div 
              className="relative cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={heroSections[heroIndex]?.imageUrl}
                alt="Hero"
                className="w-full h-48 object-cover select-none"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <p className="text-white text-xl font-semibold text-center px-4">
                  {heroSections[heroIndex]?.text}
                </p>
              </div>
              
              {/* Carousel indicators */}
              {heroSections.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {heroSections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setHeroIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === heroIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Exams */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-[var(--color-text-primary)]">Exams</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {exams.map((exam) => (
              <Card key={exam.id} title={exam.title} img={exam.imageUrl || undefined} />
            ))}
          </div>
        </section>
        
        {/* Test Series */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-[var(--color-text-primary)]">Test Series</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {testSeries.map((ts) => (
              <Card key={ts.id} title={ts.title} img={ts.imageUrl || undefined} />
            ))}
          </div>
        </section>
        
        {/* Notes */}
        <section>
          <h2 className="text-xl font-bold mb-2 text-[var(--color-text-primary)]">Notes</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {notes.map((note) => (
              <Card key={note.id} title={note.title} img={note.imageUrl || undefined} />
            ))}
          </div>
        </section>
      </main>

      {/* Sidebar and overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed top-0 right-0 h-full w-80 z-40 transition-transform duration-200 backdrop-blur-xl border-l border-white/30 shadow-lg"
            style={{ 
              transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
              backgroundColor: 'var(--sidebar-bg)'
            }}
            aria-label="Sidebar"
            aria-modal="true"
            tabIndex={-1}
          >
            {/* User Profile Section */}
            <div className="px-4 py-4 border-b border-white/30">
              {displayUser ? (
                <div className="flex items-center space-x-3 mb-4">
                  {displayUser.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={displayUser.avatar}
                      alt={displayUser.name || displayUser.email}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : displayUser.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {displayUser.name || 'User'}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">{displayUser.email}</p>
                    <p className="text-xs text-[var(--color-accent-primary)] font-medium">
                      {displayUser.role === 'ADMIN' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                  {/* Close Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Close sidebar"
                      className="text-2xl focus:outline-none text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-center py-4 flex-1">
                    <p className="text-[var(--color-text-secondary)] text-sm mb-3">Not signed in</p>
                    <button
                      onClick={() => {
                        openModal();
                        setSidebarOpen(false);
                      }}
                      className="px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-lg hover:bg-[var(--color-accent-secondary)] text-sm"
                    >
                      Sign In
                    </button>
                  </div>
                  {/* Close Button for Guest Users */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Close sidebar"
                      className="text-2xl focus:outline-none text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1 p-4">
              {displayUser ? (
                <>
                  {/* User-specific navigation */}
                  <NavLink icon={<ProfileIcon className="w-5 h-5 mr-3" />} label="Profile Settings" to="/auth/profile" />
                  <NavLink icon={<SettingsIcon className="w-5 h-5 mr-3" />} label="Settings" to="/settings" />
                  
                  {/* Admin-specific navigation */}
                  {displayUser.role === 'ADMIN' && (
                    <NavLink 
                      icon={<AdminIcon className="w-5 h-5 mr-3" />} 
                      label="Admin Dashboard" 
                      to="/admin" 
                    />
                  )}
                  
                  {/* Divider */}
                  <div className="border-t border-[var(--color-border)] my-2"></div>
                  
                  {/* Logout */}
                  <form method="post" action="/auth/logout" className="w-full">
                    <button
                      type="submit"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center py-2 px-3 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-[var(--color-text-primary)] text-left w-full"
                    >
                      <LogoutIcon className="w-5 h-5 mr-3" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                  
                  {/* Divider */}
                  <div className="border-t border-[var(--color-border)] my-2"></div>
                </>
              ) : (
                <>
                  {/* Guest navigation - settings available for theme preferences */}
                  <NavLink icon={<SettingsIcon className="w-5 h-5 mr-3" />} label="Settings" to="/settings" />
                </>
              )}
              
              {/* Common navigation for all users */}
              <NavLink icon={<CoursesIcon className="w-5 h-5 mr-3" />} label="Courses" to="/courses" />
              <NavLink icon={<DoubtsIcon className="w-5 h-5 mr-3" />} label="Doubts" to="/doubts" />
              <NavLink icon={<CommunityIcon className="w-5 h-5 mr-3" />} label="Community" to="/community" />
              <NavLink icon={<JobsIcon className="w-5 h-5 mr-3" />} label="Jobs" to="/jobs" />
              <NavLink icon={<QuizIcon className="w-5 h-5 mr-3" />} label="Quiz" to="/quiz" />
            </nav>
          </aside>
        </>
      )}

      {/* Sign-in Modal */}
      <SignInModal
        isOpen={isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        showGuestOption={modalConfig.showGuestOption}
      />
    </div>
  );
}

function Card({ title, img }: { title: string; img?: string }) {
  return (
    <div className="min-w-[160px] max-w-[180px] bg-[var(--color-card)] rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-[var(--color-border)]">
      <div className="h-28 w-full bg-[var(--color-bg-muted)] flex items-center justify-center">
        <img src={img} alt={title} className="object-cover h-full w-full" />
      </div>
      <div className="p-2 text-sm font-medium text-[var(--color-text-primary)]">{title}</div>
    </div>
  );
}

// Icon Components
function CoursesIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
}

function DoubtsIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><circle cx="12" cy="8" r="1" /></svg>;
}

function CommunityIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 16v-1a4 4 0 0 1 8 0v1" /><circle cx="12" cy="8" r="4" /></svg>;
}

function ProfileIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 8 0v2" /></svg>;
}

function SettingsIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 1 1 2.83 2.83l.06.06A1.65 1.65 0 0 0 15.4 9a1.65 1.65 0 0 0 1.82.33l.06.06a2 2 0 1 1 2.83 2.83l.06.06A1.65 1.65 0 0 0 19.4 15z" />
    </svg>
  );
}

function NavLink({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center py-2 px-3 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-[var(--color-text-primary)]">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function AdminIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
      <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
    </svg>
  );
}

function LogoutIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function JobsIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function QuizIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
      <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
    </svg>
  );
}
