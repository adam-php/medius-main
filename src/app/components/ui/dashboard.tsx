"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs"; // Import Clerk hooks
import {
    Bell, ChevronDown, CreditCard, Eye, LogOut, Menu, User as UserIcon, Users, Wallet, X,
    BarChart3, Zap, FileText, Settings, CircleDollarSign, TrendingUp, Loader2, AlertCircle, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Data Interfaces (Matching Backend Confirmation) ---
interface Deal {
    id: string; // Internal DB ID (for React keys)
    deal_id: string; // User-facing UUID (for API calls like /deals/<deal_id>)
    deal_title: string;
    seller_id: string;
    seller_username: string;
    buyer_id: string;
    buyer_username: string;
    crypto_type: string;
    amount: number;
    usd_value?: number;
    fee_payer: 'seller' | 'buyer' | 'split';
    status: 'created' | 'funded' | 'completed' | 'canceled' | 'cancel_requested_buyer' | 'cancel_requested_seller' | 'disputed' | 'in_progress' | 'pending_release'; // Ensure all possibilities are covered
    escrow_address?: string;
    created_at: string; // ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
    updated_at: string; // ISO 8601 string
    // Add other fields if backend provides them (e.g., associated_transactions)
}

interface UserStats {
    deals_completed: number;
    total_volume_usd: number;
    active_deals_count: number; // Confirmed included by backend
}

interface Contact {
    id: string;
    name: string;
    wallet_address?: string;
    medius_username?: string;
    transaction_count: number;
}

interface Notification {
    id: string;
    message: string;
    read: boolean;
    created_at: string; // ISO 8601 string
    link?: string; // Relative URL (e.g., "/deals/...")
}

interface PaginationData {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"; // Default to relative path

// --- Helper Functions ---
// Add implementations for formatCurrency, timeAgo, getInitials, getStatusBadgeVariant, getCryptoIcon
// (Make sure they handle potential null/undefined values gracefully)
function formatCurrency(value: number | undefined | null, currency = 'USD'): string {
    if (value === undefined || value === null) return 'N/A';
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(value);
    } catch (error) {
        console.warn("Currency formatting failed:", error);
        return `${value.toLocaleString()} ${currency}`;
    }
}

function timeAgo(dateString: string | undefined | null): string {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) throw new Error("Invalid date");
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 5) return "just now";
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
        return `${Math.floor(seconds)} second${seconds !== 1 ? 's' : ''} ago`;
    } catch (error) {
        console.error("Error formatting time ago:", error, "Input:", dateString);
        return "a while ago";
    }
}

function getInitials(name: string | undefined | null): string {
  if (!name || typeof name !== 'string') return "?";
  const parts = name.split(' ').filter(Boolean); // Filter out empty strings from multiple spaces
  if (parts.length === 0) return "?";
  return parts.map(n => n[0]).join('').toUpperCase();
}

function getStatusBadgeVariant(status: Deal['status'] | undefined | null): { variant: 'success' | 'warning' | 'destructive' | 'info' | 'default', className: string, text: string } {
  switch (status) {
    case 'completed': return { variant: 'success', className: 'bg-green-500/10 text-green-400 border border-green-500/20', text: 'Completed' };
    case 'funded': return { variant: 'info', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', text: 'Funded' };
    case 'in_progress': return { variant: 'info', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', text: 'In Progress' }; // Added if backend uses it
    case 'pending_release': return { variant: 'warning', className: 'bg-yellow-600/10 text-yellow-500 border border-yellow-600/20', text: 'Release Pending' }; // Changed color slightly
    case 'created': return { variant: 'default', className: 'bg-gray-500/10 text-gray-400 border border-gray-500/20', text: 'Awaiting Deposit' };
    case 'canceled': return { variant: 'destructive', className: 'bg-red-500/10 text-red-400 border border-red-500/20', text: 'Canceled' };
    case 'cancel_requested_buyer': return { variant: 'warning', className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20', text: 'Cancel Requested (You)' };
    case 'cancel_requested_seller': return { variant: 'warning', className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20', text: 'Cancel Requested (Other)' };
     case 'disputed': return { variant: 'destructive', className: 'bg-purple-600/10 text-purple-400 border border-purple-600/20', text: 'Disputed' }; // Added if backend uses it
    default: return { variant: 'default', className: 'bg-gray-700/20 text-gray-500 border border-gray-700/30', text: status || 'Unknown' };
  }
}

function getCryptoIcon(cryptoType: string | undefined | null): string {
    const cleanedType = cryptoType?.toLowerCase() || '';
    if (!cleanedType) return '?';
    if (cleanedType === 'btc') return '₿';
    if (cleanedType === 'eth') return 'Ξ';
    if (cleanedType === 'sol') return 'S';
    if (cleanedType === 'usdc' || cleanedType === 'usdt') return '$';
    if (cleanedType === 'ltc') return 'Ł';
    if (cleanedType === 'doge') return 'Ð';
    if (cleanedType === 'xrp') return '✕'; // Added based on backend note
    if (cleanedType === 'paypal') return '🅿️';
    if (cleanedType === 'algo') return 'A';
    if (cleanedType === 'base') return 'B';
    if (cleanedType === 'bnb') return 'B';
    if (cleanedType === 'avax') return 'A';
    if (cleanedType === 'matic') return 'M';
    if (cleanedType === 'trx') return 'T';
    if (cleanedType === 'xlm') return 'X';
    // Add more specific icons or fall back to initials
    return cleanedType.substring(0,1).toUpperCase();
}


export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true); // For initial page load
    const [error, setError] = useState<string | null>(null);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- Clerk Authentication ---
    const { getToken, isLoaded, isSignedIn, signOut } = useAuth();
    const { user } = useUser(); // Get user details

    // --- API Fetching Logic ---
    const fetchData = useCallback(async () => {
        if (!isLoaded || !isSignedIn) {
            setLoading(false); // Clerk not ready or user not signed in
            return;
        }

        // Only show full page loader on first load after auth is ready
        if (deals.length === 0 && userStats === null) {
             setLoading(true);
        }
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication token is missing.");

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch all data concurrently
            const [dealsRes, statsRes, contactsRes, notificationsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/deals/tickets?limit=100`, { headers }), // Fetch recent deals (adjust limit/add page later)
                fetch(`${API_BASE_URL}/stats`, { headers }),
                fetch(`${API_BASE_URL}/contacts?limit=6`, { headers }), // Fetch first few contacts
                fetch(`${API_BASE_URL}/notifications?limit=10`, { headers }) // Fetch recent notifications
            ]);

            // --- Process Deals ---
            if (!dealsRes.ok) throw new Error(`Deals fetch failed: ${dealsRes.status} ${await dealsRes.text()}`);
            const dealsData = await dealsRes.json();
            setDeals(dealsData.deals || []); // Assuming backend sends { deals: [], pagination: {} }

            // --- Process Stats ---
            if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status} ${await statsRes.text()}`);
            const statsData = await statsRes.json();
            setUserStats(statsData.stats || null); // Assuming backend sends { stats: {} }

             // --- Process Contacts ---
             if (!contactsRes.ok) throw new Error(`Contacts fetch failed: ${contactsRes.status} ${await contactsRes.text()}`);
             const contactsData = await contactsRes.json();
             setContacts(contactsData.contacts || []); // Assuming { contacts: [], pagination: {} }

             // --- Process Notifications ---
             if (!notificationsRes.ok) throw new Error(`Notifications fetch failed: ${notificationsRes.status} ${await notificationsRes.text()}`);
             const notificationsData = await notificationsRes.json();
             setNotifications(notificationsData.notifications || []); // Assuming { notifications: [], unreadCount: num, pagination: {} }
             setUnreadCount(notificationsData.unreadCount || 0);

        } catch (err) {
            console.error("Dashboard data fetch error:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching dashboard data.");
        } finally {
            setLoading(false);
        }
    }, [getToken, isLoaded, isSignedIn, deals.length, userStats]); // Re-run if auth state changes or on manual refresh potentially

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Initial fetch and updates based on dependencies in useCallback

    // --- Action Handlers ---
    const handleCopyToClipboard = (text: string | undefined | null) => {
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => console.log("Copied:", text)) // TODO: Replace with toast notification
                .catch(err => console.error("Copy failed:", err));
        }
    };

    const handleMarkNotificationRead = useCallback(async (notificationId: string) => {
        // Optimistically update UI
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");

            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                // Revert UI changes on failure
                throw new Error(`Failed to mark notification read: ${response.status}`);
            }
            console.log("Marked notification read:", notificationId);
            // No need to refetch all data, UI is already updated

        } catch (error) {
            console.error("Error marking notification read:", error);
            // Revert optimistic update
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: false } : n));
             setUnreadCount(prev => prev + 1); // This might be slightly inaccurate if multiple fail
             // Optionally show error toast
        }
    }, [getToken]);


    // --- Derived State & Calculations ---
    const activeDeals = deals.filter(d => ['created', 'funded', 'in_progress', 'pending_release', 'disputed', 'cancel_requested_buyer', 'cancel_requested_seller'].includes(d.status));
    const recentActivity = [...deals]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5); // Limit dashboard view
    const historyDeals = deals.filter(d => ['completed', 'canceled'].includes(d.status));

    const totalDeals = deals.length; // Or use pagination.totalItems if available/reliable
    const completedDealsCount = userStats?.deals_completed ?? historyDeals.filter(d => d.status === 'completed').length;
    // Calculate success rate based on completed vs (completed + canceled) from fetched history deals for accuracy
    const completedOrCanceledCount = historyDeals.length;
    const successRate = completedOrCanceledCount > 0 ? ((completedDealsCount / completedOrCanceledCount) * 100) : 100;

    // --- Loading State ---
    if (!isLoaded || loading) { // Show loader if Clerk is loading OR initial data fetch is happening
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
            </div>
        );
    }

    // --- Not Signed In State ---
    if (!isSignedIn) {
        // Optional: Redirect to sign-in page or show a message
        return (
             <div className="min-h-screen bg-black flex items-center justify-center text-white">
                Please <Link href="/sign-in" className="text-orange-500 hover:underline mx-1">sign in</Link> to view your dashboard.
            </div>
        );
    }

    // --- Error State (After Initial Load Attempt) ---
    if (error && deals.length === 0 && !userStats) { // Show full error state only if initial fetch totally failed
        return (
             <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-8 text-center relative">
                 {/* Background Grid */}
                 <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"> {/* ... grid ... */} </div>
                <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-semibold text-red-400 mb-2">Error Loading Dashboard</h2>
                <p className="text-gray-400 mb-6 max-w-md">{error}</p>
                <Button onClick={fetchData} className="bg-orange-500 hover:bg-orange-600 text-black"> Try Again </Button>
            </div>
        );
    }

    // --- Main Dashboard Render ---
    // Use user data from Clerk hook
    const currentUserDisplay = {
        id: user?.id,
        username: user?.firstName || user?.username || "User",
        avatarFallback: getInitials(user?.firstName || user?.username),
        imageUrl: user?.imageUrl
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-black text-gray-100 overflow-x-hidden">
                {/* Background Grid */}
                <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] grid-rows-[repeat(auto-fill,minmax(5rem,1fr))]"> {Array.from({ length: 100 }).map((_, i) => ( <div key={i} className={`border-[0.5px] border-orange-500/10 ${i % 7 === 0 ? "bg-orange-500/5 animate-pulse" : ""}`}></div> ))} </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-orange-900/10"></div>
                </div>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && ( <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} /> )}

                {/* Sidebar */}
                <div className={`fixed top-0 left-0 bottom-0 w-72 bg-black border-r border-orange-500/20 z-50 transition-all duration-300 transform ${ sidebarOpen ? "translate-x-0" : "-translate-x-full" } lg:translate-x-0 flex flex-col`}>
                    {/* Sidebar Header */}
                     <div className="flex items-center justify-between p-5 border-b border-orange-500/20 flex-shrink-0">
                        <Link href="/dashboard" className="flex items-center gap-3"> <img src="/image.png" alt="Medius Logo" className="h-10 w-10 rounded-lg object-contain"/> <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">Medius</span> </Link>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden text-orange-500 hover:text-orange-300 hover:bg-orange-500/10"> <X className="h-5 w-5" /> </Button>
                    </div>
                    {/* Sidebar Content */}
                    <div className="flex-grow overflow-y-auto py-5">
                        {/* Search (Functionality TBD) */}
                         <div className="px-4 mb-6">
                            <div className="relative"> <input type="text" placeholder="Search..." className="w-full bg-black border border-orange-500/30 text-gray-300 h-10 px-4 pr-10 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200 placeholder:text-gray-500"/> <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> </div> </div>
                        </div>
                        {/* Navigation */}
                         <div className="mb-2 px-5"> <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider"> Main Navigation </h3> </div>
                         <nav className="space-y-1 px-3">
                             <Button asChild variant="ghost" className="w-full justify-start gap-3 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 h-11 rounded-lg"> <Link href="/dashboard"> <CreditCard className="h-5 w-5" /> <span>Dashboard</span> </Link> </Button>
                             <Button asChild variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 h-11 rounded-lg"> <Link href="/deals"> <CircleDollarSign className="h-5 w-5" /> <span>My Escrows</span> </Link> </Button>
                             <Button asChild variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 h-11 rounded-lg"> <Link href="/contacts"> <Users className="h-5 w-5" /> <span>Contacts</span> </Link> </Button>
                             {/* Add other links as needed */}
                             {/* <Button asChild variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 h-11 rounded-lg"> <Link href="/analytics"> <TrendingUp className="h-5 w-5" /> <span>Analytics</span> </Link> </Button> */}
                         </nav>
                         <div className="mt-8 mb-2 px-5"> <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider"> Account </h3> </div>
                         <nav className="space-y-1 px-3">
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 h-11 rounded-lg"> <Link href="/profile"> <UserIcon className="h-5 w-5" /> <span>Profile</span> </Link> </Button>
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 h-11 rounded-lg"> <Link href="/settings"> <Settings className="h-5 w-5" /> <span>Settings</span> </Link> </Button>
                         </nav>
                    </div>
                     {/* Sidebar Footer */}
                    <div className="p-5 border-t border-orange-500/20 flex-shrink-0">
                         <div className="flex items-center gap-3 mb-4">
                             <Avatar className="h-10 w-10 border-2 border-orange-500/30"> <AvatarImage src={currentUserDisplay.imageUrl} alt={currentUserDisplay.username} /> <AvatarFallback className="bg-orange-500/10 text-orange-500">{currentUserDisplay.avatarFallback}</AvatarFallback> </Avatar>
                             <div><div className="font-medium text-white">{currentUserDisplay.username}</div></div>
                         </div>
                         <Button variant="outline" className="w-full justify-center gap-2 text-orange-500 border-orange-500/30 hover:bg-orange-500/10 h-11" onClick={() => signOut()}> <LogOut className="h-4 w-4" /> <span>Logout</span> </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:pl-72">
                    {/* Header */}
                    <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
                         <div className="flex items-center justify-between p-4">
                             {/* Left */}
                            <div className="flex items-center gap-2"> <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden text-orange-500 hover:text-orange-300 hover:bg-orange-500/10"> <Menu className="h-5 w-5" /> </Button> <h1 className="text-xl font-semibold hidden sm:block text-white">Dashboard</h1> </div>
                             {/* Right */}
                             <div className="flex items-center gap-3 sm:gap-4">
                                 <Button asChild className="h-10 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-black hover:from-orange-500 hover:to-orange-400 shadow-[0_0_15px_rgba(255,87,34,0.3)] hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] border-0"> <Link href="/deals/new"> <Zap className="h-4 w-4 mr-2" /> New Escrow </Link> </Button>
                                 {/* Notifications Dropdown */}
                                <DropdownMenu>
                                     <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="relative border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 text-gray-300 h-10 w-10"> <Bell className="h-5 w-5" /> {unreadCount > 0 && ( <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-xs flex items-center justify-center text-black font-bold animate-pulse">{unreadCount}</span> )} </Button>
                                    </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end" className="w-80 bg-black border-orange-500/30 text-gray-300 max-h-[70vh] overflow-y-auto">
                                         <DropdownMenuLabel className="flex justify-between items-center"><span>Notifications</span> {notifications.length > 0 && <Link href="/notifications" className="text-xs text-orange-500 hover:underline">View All</Link>}</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-orange-500/20" />
                                        {notifications.length === 0 ? ( <DropdownMenuItem disabled className="text-center text-gray-500 py-4">No notifications</DropdownMenuItem> ) : (
                                            notifications.map(notif => (
                                                 // Using Button as DropdownMenuItem for click handling
                                                 <DropdownMenuItem key={notif.id} asChild className={`p-0 focus:bg-transparent ${!notif.read ? 'bg-orange-900/10' : ''}`}>
                                                     <Link
                                                        href={notif.link || '#'}
                                                        className="block w-full px-2 py-1.5 rounded-sm hover:bg-orange-500/10 cursor-pointer transition-colors duration-200"
                                                        onClick={(e) => {
                                                            if (!notif.read) {
                                                                e.preventDefault(); // Prevent navigation until marked read
                                                                handleMarkNotificationRead(notif.id).then(() => {
                                                                    // Navigate after marking read if link exists
                                                                    if (notif.link) window.location.href = notif.link; // Simple navigation; use Next Router for client-side
                                                                });
                                                            }
                                                        }}
                                                     >
                                                         <p className={`text-sm leading-snug ${!notif.read ? 'font-medium text-white' : 'text-gray-300'}`}>{notif.message}</p>
                                                         <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.created_at)}</p>
                                                     </Link>
                                                 </DropdownMenuItem>
                                             ))
                                         )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                 {/* User Dropdown */}
                                <DropdownMenu>
                                     <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-2 hover:bg-orange-500/10 text-gray-300 h-10 px-2 rounded-full"> <Avatar className="h-8 w-8 border-2 border-orange-500/30"> <AvatarImage src={currentUserDisplay.imageUrl} /> <AvatarFallback className="bg-orange-500/10 text-orange-500">{currentUserDisplay.avatarFallback}</AvatarFallback> </Avatar> <span className="hidden sm:inline-block font-medium text-white">{currentUserDisplay.username}</span> <ChevronDown className="h-4 w-4 text-orange-500" /> </Button>
                                    </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end" className="w-56 bg-black border-orange-500/30 text-gray-300">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-orange-500/20" />
                                        <DropdownMenuItem asChild className="hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer focus:bg-orange-500/10 focus:text-orange-500"> <Link href="/profile"><UserIcon className="h-4 w-4 mr-2" /> Profile</Link> </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer focus:bg-orange-500/10 focus:text-orange-500"> <Link href="/settings"><Settings className="h-4 w-4 mr-2" /> Settings</Link> </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-orange-500/20" />
                                        <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer focus:bg-orange-500/10 focus:text-orange-500" onClick={() => signOut()}> <LogOut className="h-4 w-4 mr-2" /> Logout </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    {/* Main Content Body */}
                    <main className="p-5 md:p-6 relative z-10">
                         {/* Inline error display */}
                        {error && <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 text-red-300 rounded-lg flex items-center gap-3"> <AlertCircle className="h-5 w-5 flex-shrink-0" /> <span>{error}</span> </div>}

                        {/* Welcome Message */}
                        <div className="mb-8"> <h2 className="text-2xl font-light text-white mb-1"> Welcome back, <span className="font-semibold text-orange-500">{currentUserDisplay.username}</span> </h2> <p className="text-gray-500">Here's your Medius escrow overview.</p> </div>

                        {/* Stats Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                             <Card className="bg-black border border-orange-500/20 rounded-xl group hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(255,87,34,0.15)]"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium text-gray-400">Total Volume</CardTitle> <Wallet className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" /> </CardHeader> <CardContent> <div className="text-2xl font-bold text-white">{formatCurrency(userStats?.total_volume_usd)}</div> <p className="text-xs text-gray-500 mt-1">Lifetime transaction value</p> </CardContent> </Card>
                             <Card className="bg-black border border-orange-500/20 rounded-xl group hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(255,87,34,0.15)]"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium text-gray-400">Active Escrows</CardTitle> <CircleDollarSign className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" /> </CardHeader> <CardContent> <div className="text-2xl font-bold text-white">{userStats?.active_deals_count ?? activeDeals.length}</div> <p className="text-xs text-gray-500 mt-1">Currently open deals</p> </CardContent> </Card>
                             <Card className="bg-black border border-orange-500/20 rounded-xl group hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(255,87,34,0.15)]"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle> <TrendingUp className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" /> </CardHeader> <CardContent> <div className="text-2xl font-bold text-white">{successRate.toFixed(1)}%</div> <p className="text-xs text-gray-500 mt-1">{completedDealsCount} completed of {completedOrCanceledCount} closed</p> </CardContent> </Card>
                        </div>

                        {/* Recent Activity Section */}
                        <div className="mb-8">
                             <Card className="bg-black border border-orange-500/20 rounded-xl">
                                <CardHeader> <div className="flex justify-between items-center"> <CardTitle className="text-lg font-medium text-white">Recent Activity</CardTitle> <Button asChild variant="ghost" className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 text-sm h-8 px-3"> <Link href="/deals"> View All </Link> </Button> </div> <CardDescription className="text-gray-500 pt-1">Your latest transaction updates.</CardDescription> </CardHeader>
                                <CardContent className="p-0">
                                    {recentActivity.length === 0 ? ( <div className="text-center py-10 text-gray-500">No recent activity found.</div> ) : (
                                        <div className="divide-y divide-orange-500/10"> { recentActivity.map((deal) => {
                                            const isBuyer = deal.buyer_id === currentUserDisplay.id;
                                            const counterpartyUsername = isBuyer ? deal.seller_username : deal.buyer_username;
                                            const { variant, className: badgeClassName, text: statusText } = getStatusBadgeVariant(deal.status);
                                            return (
                                                <div key={deal.id} className="px-5 py-4 group hover:bg-orange-500/5 transition-all duration-200">
                                                    <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-2">
                                                        {/* Left */}
                                                        <div className="flex items-center min-w-0 flex-1">
                                                            <Avatar className="h-10 w-10 mr-3 border border-orange-500/30 flex-shrink-0"> <AvatarFallback className="bg-orange-500/10 text-orange-500 text-xs">{getInitials(counterpartyUsername)}</AvatarFallback> </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-white truncate" title={deal.deal_title}>{deal.deal_title}</p>
                                                                <p className="text-gray-500 flex items-center flex-wrap text-xs sm:text-sm"> <span>{isBuyer ? 'vs.' : 'with'} {counterpartyUsername}</span> <span className="mx-1.5 sm:mx-2">•</span> <Tooltip> <TooltipTrigger asChild><span>{timeAgo(deal.updated_at)}</span></TooltipTrigger> <TooltipContent className="bg-black border border-orange-500/30 text-xs"><p>{new Date(deal.updated_at).toLocaleString()}</p></TooltipContent> </Tooltip> <span className="mx-1.5 sm:mx-2">•</span> <span className="text-gray-600">{deal.deal_id}</span> </p>
                                                            </div>
                                                        </div>
                                                        {/* Right */}
                                                        <div className="flex items-center gap-4 flex-shrink-0">
                                                            <div className="text-right"> <p className="font-medium text-orange-500 flex items-center gap-1"> <span className="text-xs">{getCryptoIcon(deal.crypto_type)}</span> {deal.amount.toLocaleString()} <span className="text-xs text-gray-500 ml-0.5">{deal.crypto_type.toUpperCase()}</span> </p> <Badge className={`${badgeClassName} mt-1`}>{statusText}</Badge> </div>
                                                            <Button asChild variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 opacity-0 group-hover:opacity-100 h-8 w-8"> <Link href={`/deals/${deal.deal_id}`}><Eye className="h-4 w-4" /></Link> </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );})}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs Section */}
                        <Tabs defaultValue="active" className="mb-8">
                            <TabsList className="bg-black border border-orange-500/20 p-1 rounded-lg inline-flex mb-6 flex-wrap h-auto">
                                <TabsTrigger value="active" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black text-gray-300 data-[state=active]:shadow-[0_0_15px_rgba(255,87,34,0.5)] rounded px-4 py-2 text-sm sm:text-base flex-shrink-0"> Active Escrows ({activeDeals.length}) </TabsTrigger>
                                <TabsTrigger value="history" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black text-gray-300 data-[state=active]:shadow-[0_0_15px_rgba(255,87,34,0.5)] rounded px-4 py-2 text-sm sm:text-base flex-shrink-0"> History ({historyDeals.length}) </TabsTrigger>
                                <TabsTrigger value="contacts" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black text-gray-300 data-[state=active]:shadow-[0_0_15px_rgba(255,87,34,0.5)] rounded px-4 py-2 text-sm sm:text-base flex-shrink-0"> Contacts ({contacts.length})</TabsTrigger>
                            </TabsList>

                            {/* Active Escrows Tab */}
                            <TabsContent value="active" className="space-y-5">
                                {activeDeals.length === 0 ? (
                                    <Card className="bg-black border border-dashed border-orange-500/30"> <CardContent className="py-12 text-center"> <CircleDollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" /> <p className="text-gray-400 font-medium">No Active Escrows</p> <p className="text-sm text-gray-500 mt-1">Start a new transaction to see it here.</p> <Button asChild size="sm" className="mt-4 bg-orange-500 hover:bg-orange-600 text-black"> <Link href="/deals/new"><Zap className="h-4 w-4 mr-2"/> Create New Escrow</Link> </Button> </CardContent> </Card>
                                ) : ( activeDeals.map((deal) => {
                                        const isBuyer = deal.buyer_id === currentUserDisplay.id;
                                        const counterpartyUsername = isBuyer ? deal.seller_username : deal.buyer_username;
                                        const { className: badgeClassName, text: statusText } = getStatusBadgeVariant(deal.status);
                                        let progress = 0; if (deal.status === 'funded') progress = 33; if (deal.status === 'in_progress') progress = 66; if (deal.status === 'pending_release') progress = 90; // Simple example

                                        return (
                                        <Card key={deal.id} className="bg-black border border-orange-500/20 overflow-hidden hover:shadow-[0_0_20px_rgba(255,87,34,0.2)] group">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Details */}
                                                <div className="flex-1 p-5">
                                                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2"> <div className="flex items-center gap-2"> <Badge className={badgeClassName}>{statusText}</Badge> <span className="text-sm text-gray-500">ID: {deal.deal_id}</span> </div> <Tooltip> <TooltipTrigger asChild><span className="text-sm text-gray-500">Created: {timeAgo(deal.created_at)}</span></TooltipTrigger> <TooltipContent className="bg-black border border-orange-500/30 text-xs"><p>{new Date(deal.created_at).toLocaleString()}</p></TooltipContent> </Tooltip> </div>
                                                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-orange-500 truncate" title={deal.deal_title}> {deal.deal_title} </h3>
                                                    <div className="flex items-center gap-2 mb-4"> <Avatar className="h-7 w-7 border border-orange-500/30"> <AvatarFallback className="bg-orange-500/10 text-orange-500 text-xs">{getInitials(counterpartyUsername)}</AvatarFallback> </Avatar> <span className="text-sm text-gray-300">{isBuyer ? 'Seller' : 'Buyer'}: {counterpartyUsername}</span> </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                        <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10"> <p className="text-gray-500 mb-1">Amount</p> <p className="font-medium text-orange-500 flex items-center gap-1 flex-wrap"> <span className="text-xs">{getCryptoIcon(deal.crypto_type)}</span> {deal.amount.toLocaleString()} <span className="text-xs text-gray-400">{deal.crypto_type.toUpperCase()}</span> {deal.usd_value && <span className="text-xs text-gray-500">({formatCurrency(deal.usd_value)})</span>} </p> </div>
                                                        {deal.escrow_address && deal.crypto_type !== 'paypal' && ( <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10"> <p className="text-gray-500 mb-1">Deposit Address</p> <div className="flex items-center justify-between gap-1"> <p className="font-mono text-xs text-white truncate" title={deal.escrow_address}>{deal.escrow_address}</p> <Tooltip> <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-orange-500" onClick={() => handleCopyToClipboard(deal.escrow_address)}><Copy className="h-3 w-3"/></Button></TooltipTrigger> <TooltipContent className="bg-black border border-orange-500/30 text-xs"><p>Copy</p></TooltipContent> </Tooltip> </div> </div> )}
                                                    </div>
                                                </div>
                                                {/* Actions - Link to detail page */}
                                                <div className="flex md:flex-col justify-end gap-3 p-5 bg-gradient-to-b from-black to-orange-950/20 md:bg-gradient-to-l md:from-black md:to-orange-950/20 border-t md:border-t-0 md:border-l border-orange-500/20 md:w-[180px] items-center flex-shrink-0">
                                                     <Button asChild className="bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(255,87,34,0.3)] hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] hover:-translate-y-0.5 w-full justify-center text-sm h-9"> <Link href={`/deals/${deal.deal_id}`}> <Eye className="h-4 w-4 mr-2" /> View Details </Link> </Button>
                                                     {/* Optional: Add quick action placeholders if needed, but details page is better */}
                                                     {/* {isBuyer && ['funded', 'in_progress'].includes(deal.status) && ( <Button variant="outline" disabled className="border-green-500/30 text-green-500 w-full justify-center text-sm h-9 opacity-50 cursor-not-allowed">Release (in details)</Button> )} */}
                                                     {/* {['created', 'funded', 'in_progress'].includes(deal.status) && ( <Button variant="outline" disabled className="border-red-500/30 text-red-500 w-full justify-center text-sm h-9 opacity-50 cursor-not-allowed">Cancel (in details)</Button> )} */}
                                                </div>
                                            </div>
                                            {progress > 0 && progress < 100 && ( <div className="px-5 py-2 bg-gradient-to-r from-orange-950/10 to-black border-t border-orange-500/20"> <div className="flex justify-between items-center"> <span className="text-xs text-gray-500">Est. Progress</span> <Progress value={progress} className="w-2/5 h-1.5 bg-gray-800 [&>*]:bg-gradient-to-r [&>*]:from-orange-600 [&>*]:to-orange-400" /> </div> </div> )}
                                        </Card> );
                                    })
                                )}
                            </TabsContent>

                            {/* History Tab */}
                             <TabsContent value="history">
                                <Card className="bg-black border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,87,34,0.2)]">
                                    <CardHeader className="border-b border-orange-500/20"> <CardTitle className="text-white">Transaction History</CardTitle> <CardDescription className="text-gray-500">Completed and canceled transactions.</CardDescription> </CardHeader>
                                    <CardContent className="p-0">
                                        {historyDeals.length === 0 ? ( <div className="text-center py-10 text-gray-500">No transaction history yet.</div> ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[700px] text-sm">
                                                    <thead> <tr className="bg-gradient-to-r from-orange-950/20 to-black text-left text-gray-500 font-medium"> <th className="px-6 py-3">ID</th> <th className="px-6 py-3">Closed</th> <th className="px-6 py-3">Title</th> <th className="px-6 py-3">Counterparty</th> <th className="px-6 py-3">Amount</th> <th className="px-6 py-3">Status</th> <th className="px-6 py-3 text-right">Actions</th> </tr> </thead>
                                                    <tbody className="divide-y divide-orange-500/10"> { historyDeals.map((deal) => {
                                                        const isBuyer = deal.buyer_id === currentUserDisplay.id;
                                                        const counterpartyUsername = isBuyer ? deal.seller_username : deal.buyer_username;
                                                        const { className: badgeClassName, text: statusText } = getStatusBadgeVariant(deal.status);
                                                        return ( <tr key={deal.id} className="hover:bg-orange-500/5 group"> <td className="px-6 py-4 text-orange-500 font-medium">{deal.deal_id}</td> <td className="px-6 py-4 text-gray-300"><Tooltip> <TooltipTrigger asChild><span>{timeAgo(deal.updated_at)}</span></TooltipTrigger> <TooltipContent className="bg-black border border-orange-500/30 text-xs"><p>{new Date(deal.updated_at).toLocaleString()}</p></TooltipContent> </Tooltip></td> <td className="px-6 py-4 text-white truncate max-w-[200px]" title={deal.deal_title}>{deal.deal_title}</td> <td className="px-6 py-4 text-gray-300">{counterpartyUsername}</td> <td className="px-6 py-4 text-gray-300 flex items-center gap-1"> <span className="text-xs">{getCryptoIcon(deal.crypto_type)}</span>{deal.amount.toLocaleString()} <span className="text-xs text-gray-500">{deal.crypto_type.toUpperCase()}</span> </td> <td className="px-6 py-4"><Badge className={badgeClassName}>{statusText}</Badge></td> <td className="px-6 py-4 text-right"> <Button asChild variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 opacity-0 group-hover:opacity-100 h-8 w-8"> <Link href={`/deals/${deal.deal_id}`}><Eye className="h-4 w-4" /></Link> </Button> </td> </tr> );
                                                    })} </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </CardContent>
                                     {/* TODO: Add pagination controls if backend supports it fully */}
                                </Card>
                            </TabsContent>

                            {/* Contacts Tab */}
                            <TabsContent value="contacts">
                                 <Card className="bg-black border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,87,34,0.2)]">
                                    <CardHeader className="border-b border-orange-500/20"> <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"> <div> <CardTitle className="text-white">Trusted Contacts</CardTitle> <CardDescription className="text-gray-500 mt-1">Manage contacts for quick escrow setup.</CardDescription> </div> <Button asChild className="bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(255,87,34,0.3)] hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] w-full sm:w-auto flex-shrink-0 h-9 px-4 text-sm"> <Link href="/contacts/new"> <UserIcon className="h-4 w-4 mr-1.5"/> Add Contact </Link> </Button> </div> </CardHeader>
                                    <CardContent className="p-5">
                                        {contacts.length === 0 ? ( <div className="text-center py-10 text-gray-500">No contacts added yet.</div> ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"> { contacts.map((contact) => (
                                                <div key={contact.id} className="bg-gradient-to-br from-black to-orange-950/10 border border-orange-500/20 rounded-xl p-4 hover:shadow-[0_0_15px_rgba(255,87,34,0.2)] hover:-translate-y-1 group flex flex-col">
                                                    <div className="flex items-center gap-3 mb-4"> <Avatar className="h-10 w-10 border-2 border-orange-500/30 flex-shrink-0"> <AvatarFallback className="bg-orange-500/10 text-orange-500">{getInitials(contact.name)}</AvatarFallback> </Avatar>
                                                    <div className="overflow-hidden"> <h4 className="font-medium text-white group-hover:text-orange-500 truncate">{contact.name}</h4> { contact.wallet_address && <div className="flex items-center"> <p className="text-xs text-gray-500 truncate">{contact.wallet_address}</p> <Tooltip> <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 ml-1 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10" onClick={() => handleCopyToClipboard(contact.wallet_address)}><Copy className="h-2.5 w-2.5"/></Button></TooltipTrigger> <TooltipContent className="bg-black border border-orange-500/30 text-xs"><p>Copy Wallet</p></TooltipContent> </Tooltip> </div> } { contact.medius_username && <p className="text-xs text-gray-500 truncate">@{contact.medius_username}</p>} </div> </div>
                                                    <div className="mb-4 p-2.5 bg-orange-500/5 rounded-lg border border-orange-500/10 text-sm"> <div className="flex justify-between items-center"> <div className="text-gray-500">Transactions</div> <div className="text-orange-500 font-medium">{contact.transaction_count}</div> </div> </div>
                                                    <div className="flex gap-2 mt-auto"> <Button asChild size="sm" className="flex-1 bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_10px_rgba(255,87,34,0.3)] hover:shadow-[0_0_15px_rgba(255,87,34,0.5)] h-8"> <Link href={`/deals/new?contact=${contact.id}`}> New Deal </Link> </Button> <Button asChild size="sm" variant="outline" className="flex-1 border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 h-8"> <Link href={`/contacts/${contact.id}`}> Details </Link> </Button> </div>
                                                </div> ))
                                            } </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </Tabs>
                    </main>

                    {/* Footer */}
                    <footer className="border-t border-orange-500/20 p-5 mt-auto relative z-10"> <div className="flex flex-col md:flex-row justify-between items-center gap-4"> <div className="text-gray-500 text-sm">© {new Date().getFullYear()} Medius. All rights reserved.</div> <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center"> <Link href="/terms" className="text-gray-500 hover:text-orange-500 text-sm">Terms</Link> <Link href="/privacy" className="text-gray-500 hover:text-orange-500 text-sm">Privacy</Link> <Link href="/support" className="text-gray-500 hover:text-orange-500 text-sm">Support</Link> </div> </div> </footer>
                </div>
            </div>
        </TooltipProvider>
    );
}