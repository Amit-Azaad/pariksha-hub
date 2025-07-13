import { useEffect, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../prisma.server";
import "../styles/scrollbar-hide.css";
import { Link, useLocation } from "@remix-run/react";

export const meta: MetaFunction = () => [
  { title: "Exam Prep Platform" },
  { name: "description", content: "A PWA for exam aspirants to prepare for competitive exams." },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const [exams, testSeries, notes, heroSections] = await Promise.all([
    prisma.exam.findMany({ orderBy: { id: "asc" }, take: 10 }),
    prisma.testSeries.findMany({ orderBy: { id: "asc" }, take: 10 }),
    prisma.note.findMany({ orderBy: { id: "asc" }, take: 10 }),
    prisma.heroSection.findMany({ orderBy: { id: "asc" } }),
  ]);
  return json({ exams, testSeries, notes, heroSections });
}

export default function Index() {
  const { exams, testSeries, notes, heroSections } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const location = useLocation();

  // Carousel auto-advance
  useEffect(() => {
    if (heroSections.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSections.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroSections.length]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with search and menu */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <button
          className="text-2xl font-bold"
          aria-label="Open menu"
          onClick={() => {
            console.log('Menu icon clicked');
            setSidebarOpen(true);
          }}
        >
          &#9776;
        </button>
        <div className="flex-1 mx-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Link to="/profile" aria-label="Profile" className="text-xl">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
          </svg>
        </Link>
      </header>

      {/* Sidebar and overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-200 backdrop-blur-xl bg-white/60 border-r border-white/30 shadow-lg"
            style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
            aria-label="Sidebar"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/30">
              <span className="text-lg font-bold">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="text-2xl focus:outline-none"
              >
                &times;
              </button>
            </div>
            <nav className="flex flex-col gap-2 p-4">
              <NavLink icon={<HomeIcon className="w-5 h-5 mr-2" />} label="Home" />
              <NavLink icon={<CoursesIcon className="w-5 h-5 mr-2" />} label="Courses" />
              <NavLink icon={<DoubtsIcon className="w-5 h-5 mr-2" />} label="Doubts" />
              <NavLink icon={<CommunityIcon className="w-5 h-5 mr-2" />} label="Community" />
              <NavLink icon={<ProfileIcon className="w-5 h-5 mr-2" />} label="Profile" />
            </nav>
          </aside>
        </>
      )}

      {/* Hero image */}
      <div className="w-full flex justify-center py-6">
        {heroSections.length > 0 && (
          <div className="relative w-full max-w-xl">
            <img src={heroSections[heroIndex].imageUrl} alt="Hero" className="w-full h-56 object-cover rounded-xl" />
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-lg font-semibold bg-black bg-opacity-40 px-4 py-2 rounded-b-xl">
              {heroSections[heroIndex].text}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSections.map((_: any, idx: number) => (
                <button key={idx} className={`w-2 h-2 rounded-full ${idx === heroIndex ? 'bg-white' : 'bg-gray-400'} transition`} onClick={() => setHeroIndex(idx)} aria-label={`Go to slide ${idx + 1}`}></button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 pb-24">
        {/* Exams */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">Exams</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {exams.map((exam: { id: number; title: string; imageUrl?: string }) => (
              <Card key={exam.id} title={exam.title} img={exam.imageUrl} />
            ))}
          </div>
        </section>
        {/* Test Series */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">Test Series</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {testSeries.map((ts: { id: number; title: string; imageUrl?: string }) => (
              <Card key={ts.id} title={ts.title} img={ts.imageUrl} />
            ))}
          </div>
        </section>
        {/* Notes */}
        <section>
          <h2 className="text-xl font-bold mb-2">Notes</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {notes.map((note: { id: number; title: string; imageUrl?: string }) => (
              <Card key={note.id} title={note.title} img={note.imageUrl} />
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-50">
        <NavItem icon={HomeIcon} label="Home" to="/" active={location.pathname === "/"} />
        <NavItem icon={JobsIcon} label="Jobs" to="/jobs" active={location.pathname === "/jobs"} />
        <NavItem icon={NotificationsIcon} label="Notifications" to="/notifications" active={location.pathname === "/notifications"} />
        <NavItem icon={ProfileIcon} label="Profile" to="/profile" active={location.pathname === "/profile"} />
      </nav>
    </div>
  );
}

function Card({ title, img }: { title: string; img?: string }) {
  return (
    <div className="min-w-[160px] max-w-[180px] bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
      <div className="h-28 w-full bg-gray-200 flex items-center justify-center">
        <img src={img} alt={title} className="object-cover h-full w-full" />
      </div>
      <div className="p-2 text-sm font-medium text-gray-800">{title}</div>
    </div>
  );
}

function NavItem({ icon: Icon, label, to, active }: { icon: any; label: string; to: string; active?: boolean }) {
  return (
    <Link to={to} prefetch="intent" className={`flex flex-col items-center text-xs ${active ? "text-blue-600" : "text-gray-500"}`}>
      <Icon className="w-6 h-6 mb-1" />
      {label}
    </Link>
  );
}

function HomeIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9" /><path d="M9 21V9h6v12" /></svg>;
}
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

function NavLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <a href="#" className="flex items-center py-2 px-3 rounded-lg hover:bg-white/40 transition">
      {icon}
      <span>{label}</span>
    </a>
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
function NotificationsIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
    </svg>
  );
}
