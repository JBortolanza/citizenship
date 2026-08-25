import { useState } from "react";
import {
  HouseIcon,
  FolderSimpleIcon,
  BellIcon,
  GearIcon,
  SignOutIcon,
  UserIcon,
  ChartLineUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/auth";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo / Brand */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Portal System
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <HouseIcon size={20} />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("processes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "processes"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderSimpleIcon size={20} />
              Processes
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <GearIcon size={20} />
              Settings
            </button>
          </nav>
        </div>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <SignOutIcon size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative">
              <BellIcon size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user?.name || "User"}! 👋
            </h1>
            <p className="text-slate-400 text-sm">
              Here is an overview of your current active processes and system
              status.
            </p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Active Requests
                </p>
                <p className="text-3xl font-extrabold text-slate-900">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FolderSimpleIcon size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  In Progress
                </p>
                <p className="text-3xl font-extrabold text-slate-900">4</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <ClockIcon size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Completed
                </p>
                <p className="text-3xl font-extrabold text-slate-900">28</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircleIcon size={24} />
              </div>
            </div>
          </div>

          {/* Activity Placeholder Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ChartLineUpIcon size={20} className="text-blue-600" />
                Recent Activity
              </h3>
            </div>
            <div className="h-48 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
              Your tables, charts, or primary process content will live here.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
