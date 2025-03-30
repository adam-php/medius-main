// app/deals/[deal_id]/page.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import toast, { Toaster } from 'react-hot-toast'; // Using react-hot-toast
import {
    ArrowRight, Bell, Check, Clock, Copy, CreditCard, DollarSign, Download, ExternalLink, Eye,
    FileText, HelpCircle, Lock, Search, Send, Shield, Wallet, Loader2, AlertCircle, Paperclip, X,
    User as UserIcon, Settings, LogOut, WifiOff, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils"; // Ensure this path is correct

// Import specific crypto icons (No USDC/USDT import needed)
import Btc from 'react-crypto-icons';
import Eth from 'react-crypto-icons';
import Ltc from 'react-crypto-icons';
import Sol from 'react-crypto-icons';
import Algo from 'react-crypto-icons';
import Doge from 'react-crypto-icons';
import Bnb from 'react-crypto-icons';
import Avax from 'react-crypto-icons';
import Matic from 'react-crypto-icons';
import Trx from 'react-crypto-icons';
import Xlm from 'react-crypto-icons';

// --- Data Interfaces ---
interface Deal { id: string; deal_id: string; deal_title: string; seller_id: string; seller_username: string; buyer_id: string; buyer_username: string; crypto_type: string; amount: number; usd_value?: number; fee_payer: 'seller' | 'buyer' | 'split'; status: 'created' | 'funded' | 'completed' | 'canceled' | 'cancel_requested_buyer' | 'cancel_requested_seller' | 'disputed' | 'in_progress' | 'pending_release'; escrow_address?: string; created_at: string; updated_at: string; fee_amount?: number; fee_usd_value?: number; }
interface ChatMessage { id: string; sender_id: string; sender_username: string; message: string; created_at: string; type: 'user' | 'system' | 'transaction_card' | 'wallet_card' | 'file'; file_url?: string; file_name?: string; file_size?: number; transaction_hash?: string; transaction_from?: string; transaction_to?: string; transaction_amount?: number; transaction_currency?: string; transaction_gas_fee?: number; wallet_address?: string; wallet_network?: string; }

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
const MAX_RECONNECT_ATTEMPTS = 5; const BASE_RECONNECT_DELAY = 1000; const MAX_RECONNECT_DELAY = 30000;

// --- Helper Functions ---
function formatCurrency(value: number | undefined | null, currency = 'USD'): string { if (value === undefined || value === null) return 'N/A'; try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(value); } catch (error) { console.warn("Currency formatting failed:", error); return `${value.toLocaleString()} ${currency}`; } }
function timeAgo(dateString: string | undefined | null): string { if (!dateString) return "N/A"; try { const date = new Date(dateString); if (isNaN(date.getTime())) throw new Error("Invalid date"); const now = new Date(); const seconds = Math.floor((now.getTime() - date.getTime()) / 1000); if (seconds < 5) return "just now"; let interval = Math.floor(seconds / 31536000); if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`; interval = Math.floor(seconds / 2592000); if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`; interval = Math.floor(seconds / 86400); if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`; interval = Math.floor(seconds / 3600); if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`; interval = Math.floor(seconds / 60); if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`; return `${Math.floor(seconds)} second${seconds !== 1 ? 's' : ''} ago`; } catch (error) { console.error("Error formatting time ago:", error, "Input:", dateString); return "a while ago"; } }
function getInitials(name: string | undefined | null): string { if (!name || typeof name !== 'string') return "?"; const parts = name.split(' ').filter(Boolean); if (parts.length === 0) return "?"; return parts.map(n => n[0]).join('').toUpperCase(); }
function getStatusBadgeVariant(status: Deal['status'] | undefined | null): { variant: any; className: string; text: string; icon?: React.ElementType} { switch (status) { case 'completed': return { variant: 'success', className: 'bg-green-500/10 text-green-400 border border-green-500/20', text: 'Completed', icon: Check }; case 'funded': return { variant: 'info', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', text: 'Funded', icon: Check }; case 'in_progress': return { variant: 'info', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', text: 'In Progress', icon: Clock }; case 'pending_release': return { variant: 'warning', className: 'bg-yellow-600/10 text-yellow-500 border border-yellow-600/20', text: 'Release Pending', icon: Clock }; case 'created': return { variant: 'default', className: 'bg-gray-500/10 text-gray-400 border border-gray-500/20', text: 'Awaiting Deposit', icon: Clock }; case 'canceled': return { variant: 'destructive', className: 'bg-red-500/10 text-red-400 border border-red-500/20', text: 'Canceled', icon: X }; case 'cancel_requested_buyer': return { variant: 'warning', className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20', text: 'Cancel Req. (Buyer)', icon: HelpCircle }; case 'cancel_requested_seller': return { variant: 'warning', className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20', text: 'Cancel Req. (Seller)', icon: HelpCircle }; case 'disputed': return { variant: 'destructive', className: 'bg-purple-600/10 text-purple-400 border border-purple-600/20', text: 'Disputed', icon: Shield }; default: return { variant: 'default', className: 'bg-gray-700/20 text-gray-500 border border-gray-700/30', text: status || 'Unknown', icon: HelpCircle }; } }
function formatFileSize(bytes: number | undefined | null): string { if (bytes === undefined || bytes === null || bytes <= 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]; }

// *** MODIFIED getCryptoIcon Function ***
function getCryptoIcon(cryptoType: string | undefined | null, size: number = 16): React.ReactNode {
    const cleanedType = cryptoType?.toLowerCase() || '';
    if (!cleanedType) return <HelpCircle size={size} className="text-gray-500" />;

    switch (cleanedType) {
        case 'btc': return <Btc size={size} />;
        case 'eth': return <Eth size={size} />;
        case 'ltc': return <Ltc size={size} />;
        case 'sol': return <Sol size={size} />;
        case 'algo': return <Algo size={size} />;
        case 'doge': return <Doge size={size} />;
        case 'base': return <span style={{ fontSize: `${size * 0.8}px` }} className="font-bold text-blue-400">B</span>;
        case 'bnb': return <Bnb size={size} />;
        case 'avax': return <Avax size={size} />;
        case 'matic': return <Matic size={size} />;
        case 'trx': return <Trx size={size} />;
        case 'xlm': return <Xlm size={size} />;
        case 'xrp': return <span style={{ fontSize: `${size * 0.8}px` }} className="font-bold text-blue-500">✕</span>;
        case 'paypal': return <CreditCard size={size * 0.9} className="text-blue-400" />;
        // No explicit USDC, USDT cases

        default:
             if (cleanedType.includes('usd')) { // Catch common stablecoins like USDC, USDT, TUSD, DAI (if named with 'usd')
                 return <DollarSign size={size * 0.9} className="text-green-500"/>;
             }
            const firstLetter = cleanedType.substring(0, 1).toUpperCase();
            if (firstLetter.match(/[A-Z]/)) {
                 return <span style={{ fontSize: `${size * 0.8}px` }} className="font-bold">{firstLetter}</span>;
            }
            return <HelpCircle size={size} className="text-gray-500"/>; // Final fallback
    }
}


// --- Main Component ---
export default function DealChatPage() {
    // --- State variables ---
    const [deal, setDeal] = useState<Deal | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingDeal, setLoadingDeal] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [errorDeal, setErrorDeal] = useState<string | null>(null);
    const [errorMessages, setErrorMessages] = useState<string | null>(null);
    const [wsError, setWsError] = useState<string | null>(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingSignedUrlKey, setLoadingSignedUrlKey] = useState<string | null>(null);

    // --- Hooks ---
    const params = useParams();
    const dealId = params?.deal_id as string;
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const ws = useRef<WebSocket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- Scroll Chat ---
    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
         if (chatContainerRef.current) { chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: behavior }); }
     }, []);
    useEffect(() => { if (!loadingMessages) { const container = chatContainerRef.current; const shouldScroll = !container || (container.scrollHeight - container.scrollTop - container.clientHeight < 150); if(shouldScroll) { scrollToBottom("smooth"); } } }, [messages, loadingMessages, scrollToBottom]);
    useEffect(() => { if (!loadingMessages && messages.length > 0) { const timer = setTimeout(() => scrollToBottom("auto"), 100); return () => clearTimeout(timer); } }, [loadingMessages]);

    // --- API Fetching ---
    const fetchDealDetails = useCallback(async (showLoader = false) => {
         if (!isLoaded || !isSignedIn || !dealId) return;
         if (showLoader) setLoadingDeal(true);
         setErrorDeal(null); setActionError(null);
         try { const token = await getToken(); if (!token) throw new Error("Auth token missing."); const headers = { 'Authorization': `Bearer ${token}` }; const response = await fetch(`${API_BASE_URL}/deals/${dealId}`, { headers }); if (!response.ok) { if (response.status === 404) throw new Error("Deal not found."); if (response.status === 403) throw new Error("Unauthorized."); const errData = await response.json().catch(() => ({})); throw new Error(errData.error || `Failed: ${response.status}`); } const data = await response.json(); setDeal(data.deal); }
         catch (err) { console.error("Error fetching deal:", err); const errorMsg = err instanceof Error ? err.message : "Failed to load deal details."; setErrorDeal(errorMsg); setDeal(null); }
         finally { if (showLoader) setLoadingDeal(false); }
     }, [dealId, getToken, isLoaded, isSignedIn]);

    const fetchInitialChatMessages = useCallback(async () => {
         if (!isLoaded || !isSignedIn || !dealId) return;
         setLoadingMessages(true); setErrorMessages(null);
         try { const token = await getToken(); if (!token) throw new Error("Auth token missing."); const headers = { 'Authorization': `Bearer ${token}` }; const response = await fetch(`${API_BASE_URL}/deals/${dealId}/chat`, { headers }); if (!response.ok) { if (response.status === 404) { setMessages([]); return; } const errData = await response.json().catch(() => ({})); throw new Error(errData.error || `Failed: ${response.status}`); } const data = await response.json(); setMessages(data.messages || []); }
         catch (err) { console.error("Error fetching initial messages:", err); setErrorMessages(err instanceof Error ? err.message : "Failed to load chat history."); setMessages([]); }
         finally { setLoadingMessages(false); }
     }, [dealId, getToken, isLoaded, isSignedIn]);

    // --- WebSocket Connection ---
    const connectWebSocket = useCallback(async () => {
        if (!WEBSOCKET_URL) { console.error("WebSocket URL missing."); setWsError("Chat service unavailable."); return; }
        if (!dealId || !isLoaded || !isSignedIn || (ws.current && ws.current.readyState === WebSocket.OPEN)) return;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        setWsError(null);
        console.log(`Attempting WebSocket connection (Attempt: ${reconnectAttemptRef.current + 1})...`);
        try {
            const token = await getToken(); if (!token) { throw new Error("Auth required"); }
            const wsUrlWithToken = `${WEBSOCKET_URL}?token=${token}&dealId=${dealId}`;
            ws.current = new WebSocket(wsUrlWithToken);
            reconnectAttemptRef.current++;
            ws.current.onopen = () => { console.log("WS connected:", dealId); setWsConnected(true); reconnectAttemptRef.current = 0; setWsError(null); toast.success("Chat connected", {id: "ws-conn-toast", duration: 2000}); };
            ws.current.onmessage = (event) => {
                 try {
                     const data = JSON.parse(event.data as string); console.log("WS Message:", data);
                     if (data.type === 'new_message' && data.message) {
                         const newMessage = data.message as ChatMessage;
                         setMessages(prev => { const tempIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.created_at === newMessage.created_at && m.sender_id === newMessage.sender_id); if (tempIndex !== -1) { const updated = [...prev]; updated[tempIndex] = newMessage; return updated; } else if (!prev.some(m => m.id === newMessage.id)) { return [...prev, newMessage]; } return prev; });
                     } else if (data.type === 'deal_status_update' && data.deal) { const updatedDealFields = data.deal as Partial<Deal>; setDeal(prevDeal => prevDeal ? { ...prevDeal, ...updatedDealFields } : null); toast(`Deal status: ${getStatusBadgeVariant(updatedDealFields.status).text}`, { icon: 'ℹ️' }); }
                     else if (data.type === 'error') { console.error("WS server error:", data.error); toast.error(`Chat error: ${data.error}`); setWsError(data.error || "Unknown chat server error"); }
                 } catch (e) { console.error("WS message parse error:", e); }
            };
            ws.current.onerror = (error) => { console.error("WS error:", error); setWsError("Chat connection error."); setWsConnected(false); };
            ws.current.onclose = (event) => {
                 console.log(`WS closed: ${event.code}`); setWsConnected(false); ws.current = null;
                 if (event.code !== 1000 && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) { const delay = Math.min(MAX_RECONNECT_DELAY, BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current)); console.log(`WS Retrying in ${delay / 1000}s...`); if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay); }
                 else if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) { console.error("WS gave up."); setWsError("Chat disconnected permanently. Refresh needed."); toast.error("Chat disconnected. Refresh.", { duration: Infinity, id: "ws-conn-toast" }); }
            };
        } catch (error) { console.error("WS Connection setup failed:", error); setWsError(error instanceof Error ? error.message : "Chat connection failed."); setWsConnected(false); }
    }, [dealId, getToken, isLoaded, isSignedIn]);

    useEffect(() => { connectWebSocket(); return () => { console.log("Cleaning up WS for:", dealId); if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current); if (ws.current) { ws.current.onclose = null; ws.current.close(1000); ws.current = null; } setWsConnected(false); reconnectAttemptRef.current = 0; }; }, [connectWebSocket, dealId]);

    // --- Initial Data Fetch ---
    useEffect(() => {
        if (dealId && isLoaded && isSignedIn) { setLoadingDeal(true); Promise.all([fetchDealDetails(true), fetchInitialChatMessages()]); }
        else if (isLoaded && !isSignedIn) { setLoadingDeal(false); setErrorDeal("Please sign in."); }
        else if (!dealId) { setLoadingDeal(false); setErrorDeal("Deal ID missing."); }
    }, [dealId, isLoaded, isSignedIn, fetchDealDetails, fetchInitialChatMessages]);

    // --- Send Message Handler (WebSocket) ---
    const handleSendMessage = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault(); const messageToSend = newMessage.trim(); if (!messageToSend || !deal || !user || sendingMessage || !wsConnected) { if (!wsConnected) toast.error("Chat not connected."); return; } const receiverId = deal.buyer_id === user.id ? deal.seller_id : deal.buyer_id; setSendingMessage(true); setWsError(null); const tempId = `temp-${Date.now()}`; const optimisticMessage: ChatMessage = { id: tempId, sender_id: user.id, sender_username: user.firstName || user.username || "You", message: messageToSend, created_at: new Date().toISOString(), type: 'user', }; setMessages(prev => [...prev, optimisticMessage]); setNewMessage(""); try { if (!ws.current || ws.current.readyState !== WebSocket.OPEN) throw new Error("WebSocket not open"); ws.current.send(JSON.stringify({ type: 'send_message', receiver_id: receiverId, message: messageToSend, deal_id: deal.deal_id, tempId: tempId })); } catch (err) { console.error("Error sending WS message:", err); const errorMsg = err instanceof Error ? err.message : "Failed"; toast.error(`Message failed: ${errorMsg}`); setMessages(prev => prev.filter(msg => msg.id !== tempId)); setNewMessage(messageToSend); setWsError(errorMsg); } finally { setSendingMessage(false); }
    }, [newMessage, deal, user, sendingMessage, wsConnected, ws, getToken]);

    // --- File Upload Logic ---
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { handleUploadFile(file); } if (event.target) { event.target.value = ''; } };
    const handleUploadFile = useCallback(async (file: File) => {
         if (!deal || !user || isUploading || !wsConnected) { toast.error("Cannot upload file now."); return; } setIsUploading(true); const uploadToastId = toast.loading(`Uploading ${file.name}...`); setActionError(null);
         try { const token = await getToken(); if (!token) throw new Error("Auth token missing."); const formData = new FormData(); formData.append('file', file);
             const response = await fetch(`${API_BASE_URL}/deals/${dealId}/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData, }); if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `Upload failed: ${response.status}`); }
             toast.success(`${file.name} uploaded! Processing...`, { id: uploadToastId }); /* Rely on WS broadcast */
         } catch (err) { console.error("Error uploading file:", err); const errorMsg = err instanceof Error ? err.message : "Failed"; toast.error(`Upload failed: ${errorMsg}`, { id: uploadToastId }); setActionError(errorMsg); }
         finally { setIsUploading(false); }
     }, [deal, user, isUploading, getToken, dealId, wsConnected]);

    // --- Fetch Signed URL Handler ---
    const fetchAndOpenSignedUrl = useCallback(async (fileKey: string | undefined | null) => {
        if (!fileKey || loadingSignedUrlKey === fileKey) return; setLoadingSignedUrlKey(fileKey); const urlLoadToastId = toast.loading("Generating secure link...");
        try { const token = await getToken(); if (!token) throw new Error("Auth required."); const response = await fetch(`${API_BASE_URL}/files/signed-url?key=${encodeURIComponent(fileKey)}`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `Failed: ${response.status}`); } const data = await response.json(); if (!data.signedUrl) throw new Error("Invalid link received."); toast.success("Link generated!", { id: urlLoadToastId }); window.open(data.signedUrl, '_blank', 'noopener,noreferrer'); }
        catch (err) { console.error("Error getting signed URL:", err); const errorMsg = err instanceof Error ? err.message : "Could not open file."; toast.error(`Error: ${errorMsg}`, { id: urlLoadToastId }); }
        finally { setLoadingSignedUrlKey(null); }
    }, [getToken, loadingSignedUrlKey]);

    // --- Action Handlers ---
    const handleReleaseFunds = async () => {
        if (!deal || !dealId || actionLoading) return; if (!window.confirm("Release funds? Cannot be undone.")) return; const originalDeal = { ...deal }; setActionLoading('release'); setActionError(null); setDeal(prev => prev ? { ...prev, status: 'completed' } : null);
        try { const token = await getToken(); if (!token) throw new Error("Auth missing"); const response = await fetch(`${API_BASE_URL}/deals/${dealId}/release`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e.error || `Failed: ${response.status}`); } const d = await response.json(); setDeal(d.deal); toast.success("Funds Released!"); }
        catch (err) { const msg = err instanceof Error ? err.message : "Failed"; toast.error(`Release Failed: ${msg}`); setDeal(originalDeal); setActionError(msg); } finally { setActionLoading(null); }
    };
    const handleCancelRequestOrConfirm = async () => {
        if (!deal || !dealId || actionLoading) return; const isConfirming = deal.status === `cancel_requested_${user?.id === deal.buyer_id ? 'seller' : 'buyer'}`; const confirmMsg = isConfirming ? "Confirm cancellation?" : "Request cancellation?"; if (!window.confirm(confirmMsg)) return; const originalDeal = { ...deal }; setActionLoading('cancel'); setActionError(null); const optimisticStatus = isConfirming ? 'canceled' : `cancel_requested_${user?.id === deal.buyer_id ? 'buyer' : 'seller'}` as Deal['status']; setDeal(prev => prev ? { ...prev, status: optimisticStatus } : null);
        try { const token = await getToken(); if (!token) throw new Error("Auth missing"); const response = await fetch(`${API_BASE_URL}/deals/${dealId}/cancel_request`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e.error || `Action failed: ${response.status}`); } const d = await response.json(); setDeal(d.deal); toast.success(isConfirming ? "Canceled" : "Requested"); }
        catch (err) { const msg = err instanceof Error ? err.message : "Failed"; toast.error(`Action Failed: ${msg}`); setDeal(originalDeal); setActionError(msg); } finally { setActionLoading(null); }
    };
    const handleCopyToClipboard = (text: string | undefined | null) => { if (text) { navigator.clipboard.writeText(text).then(() => toast.success("Copied!")).catch(() => toast.error("Copy failed.")); } };

    // --- Render Logic ---
    if (!isLoaded || loadingDeal) { return ( <div className="flex h-screen w-screen bg-black items-center justify-center"> <Loader2 className="h-16 w-16 text-orange-500 animate-spin" /> </div> ); }
    if (!isSignedIn && isLoaded) { return ( <div className="flex h-screen w-screen bg-black items-center justify-center text-white"> Please <Link href={`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`} className="text-orange-500 hover:underline mx-1">sign in</Link> to view this deal. </div> ); }
    if (errorDeal && !deal) { return ( <div className="flex h-screen w-screen bg-black items-center justify-center text-center p-8"> <div className="flex flex-col items-center"> <AlertCircle className="h-16 w-16 text-red-500 mb-4" /> <h2 className="text-xl text-red-400 font-semibold mb-2">Error Loading Deal</h2> <p className="text-gray-400 mb-6">{errorDeal}</p> <Button onClick={() => fetchDealDetails(true)} className="bg-orange-600 hover:bg-orange-700">Try Again</Button> <Link href="/dashboard" className="mt-4 text-sm text-gray-400 hover:text-orange-500">Back to Dashboard</Link></div> </div> ); }
    if (!deal) { return ( <div className="flex h-screen w-screen bg-black items-center justify-center text-center p-8 text-gray-400"> Deal data unavailable. <Link href="/dashboard" className="ml-2 text-orange-500 hover:underline">Back</Link> </div> ); }

    // Derived states
    const isCurrentUserBuyer = user?.id === deal.buyer_id;
    const { variant: statusVariant, className: statusBadgeClass, text: statusText, icon: StatusIcon } = getStatusBadgeVariant(deal.status);
    let cancelActionText = "Request Cancel"; let cancelActionVariant: "outline" | "destructive" = "outline"; let cancelActionHandler = handleCancelRequestOrConfirm; let cancelActionDisabled = actionLoading !== null || ['completed', 'canceled'].includes(deal.status);
    if (deal.status === `cancel_requested_${isCurrentUserBuyer ? 'buyer' : 'seller'}`) { cancelActionText = "Cancel Requested"; cancelActionDisabled = true; } else if (deal.status === `cancel_requested_${!isCurrentUserBuyer ? 'buyer' : 'seller'}`) { cancelActionText = "Confirm Cancellation"; cancelActionVariant = "destructive"; }
    const canChat = ['created', 'funded', 'in_progress', 'pending_release', 'cancel_requested_buyer', 'cancel_requested_seller', 'disputed'].includes(deal.status);
    const isPayPalDeal = deal.crypto_type.toLowerCase() === 'paypal';

    return (
        <TooltipProvider>
            <div className="flex h-screen w-screen bg-black text-white">
                <div className="flex flex-col w-full overflow-hidden">
                    {/* Main container */}
                    <div className="flex flex-1 bg-black min-h-0">
                        {/* Chat area */}
                        <div className="flex-1 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5 text-orange-500" /></div>
                                    <div> <div className="text-white font-medium truncate" title={deal.deal_title}>{deal.deal_title || "Escrow Transaction"}</div> <div className="text-gray-400 text-xs">#{deal.deal_id}</div> </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Tooltip> <TooltipTrigger> <div className={cn("w-3 h-3 rounded-full transition-colors duration-500", wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500')}/> </TooltipTrigger> <TooltipContent><p>Chat {wsConnected ? 'Connected' : 'Disconnected'}{wsError ? ` (${wsError})`:''}</p></TooltipContent> </Tooltip>
                                    <Link href="/dashboard"><Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800 h-9">Dashboard</Button></Link>
                                </div>
                            </div>

                            {/* Transaction details bar */}
                            <div className="bg-[#111] border-b border-gray-800 p-4 flex-shrink-0">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-x-6 gap-y-4">
                                    <div className="flex flex-col gap-1"> <div className="text-gray-400 text-xs uppercase tracking-wider">Status</div> <Badge variant={statusVariant} className={statusBadgeClass}> {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />} {statusText} </Badge> </div>
                                    <div className="flex flex-col gap-1 text-left md:text-right"> <div className="text-gray-400 text-xs uppercase tracking-wider">Amount</div> <div className="text-white font-medium text-lg flex items-center justify-start md:justify-end gap-1.5"> <span className="flex items-center h-5 w-5">{getCryptoIcon(deal.crypto_type, 20)}</span> <span>{deal.amount.toLocaleString()}</span> <span className="text-xs text-gray-400">{deal.crypto_type.toUpperCase()}</span> {deal.usd_value && <span className="text-xs text-gray-500">({formatCurrency(deal.usd_value)})</span>} </div> </div>
                                    <div className="flex flex-col gap-1 text-left md:text-right"> <div className="text-gray-400 text-xs uppercase tracking-wider">Escrow Fee</div> <div className="text-gray-300 text-sm flex items-center justify-start md:justify-end gap-1.5"> {deal.fee_amount ? (<><span className="flex items-center h-4 w-4">{getCryptoIcon(deal.crypto_type, 16)}</span><span>{deal.fee_amount.toLocaleString()}</span><span className="text-xs">{deal.crypto_type.toUpperCase()}</span></>) : 'N/A'} {deal.fee_usd_value && <span className="text-xs text-gray-500 ml-1">({formatCurrency(deal.fee_usd_value)})</span>} </div> </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-shrink-0">
                                        {isCurrentUserBuyer && ['funded', 'in_progress', 'pending_release'].includes(deal.status) && ( <Button onClick={handleReleaseFunds} className="bg-green-600 hover:bg-green-700 text-white h-9 px-3 text-sm" disabled={actionLoading === 'release'}> {actionLoading === 'release' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>} Release Funds </Button> )}
                                        {!['completed', 'canceled'].includes(deal.status) && ( <Button variant={cancelActionVariant} size="sm" className={cn("h-9 px-3 text-sm", cancelActionVariant === 'outline' && "border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300")} onClick={cancelActionHandler} disabled={cancelActionDisabled} > {actionLoading === 'cancel' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (cancelActionText === "Confirm Cancellation" ? <Check className="mr-2 h-4 w-4"/> : <X className="mr-2 h-4 w-4"/>) } {cancelActionText} </Button> )}
                                    </div>
                                </div>
                                {actionError && !actionLoading && ( <div className="mt-3 text-xs text-red-400 bg-red-900/30 p-2 rounded border border-red-500/50 flex items-center gap-2"> <AlertCircle className="h-4 w-4 flex-shrink-0"/> Action Error: {actionError}</div> )}
                                {wsError && ( <div className="mt-3 text-xs text-red-400 bg-red-900/30 p-2 rounded border border-red-500/50 flex items-center gap-2"> <WifiOff className="h-4 w-4 flex-shrink-0"/> Chat Error: {wsError}</div> )}
                                {isPayPalDeal && !['completed', 'canceled'].includes(deal.status) && ( <div className="mt-3 text-xs text-yellow-300 bg-yellow-900/40 p-2 rounded border border-yellow-500/50 flex items-center gap-2"> <Info className="h-4 w-4 flex-shrink-0 text-yellow-400"/> <span>Important: PayPal transactions must be completed within 29 days.</span> </div> )}
                            </div>

                            {/* Chat messages */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loadingMessages && messages.length === 0 && ( <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 text-orange-500 animate-spin" /> <span className="ml-2 text-gray-400">Loading messages...</span></div> )}
                                {errorMessages && !loadingMessages && ( <div className="text-center text-red-400 bg-red-900/20 p-3 rounded">Error loading history: {errorMessages} <Button variant="link" size="sm" onClick={fetchInitialChatMessages} className="text-orange-500">Retry</Button></div> )}
                                {!loadingMessages && messages.length === 0 && !errorMessages && ( <div className="text-center text-gray-500 py-10">No messages yet. Start the conversation!</div> )}

                                {messages.map((msg, index) => {
                                    const isCurrentUserSender = msg.sender_id === user?.id;
                                    const currentDate = new Date(msg.created_at).toDateString(); const prevDate = index > 0 ? new Date(messages[index - 1].created_at).toDateString() : null; const showDateDivider = index === 0 || currentDate !== prevDate;
                                    const isFileLoading = loadingSignedUrlKey === msg.file_url; // Key for file messages

                                    return ( <div key={msg.id}> {showDateDivider && ( <div className="relative flex items-center justify-center my-4"><div className="absolute border-t border-gray-700 w-full"></div><span className="relative bg-black text-gray-400 text-xs px-2">{new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div> )}
                                        {msg.type === 'system' && ( <div className="flex justify-center my-2"><div className="bg-[#1a1a1a] text-gray-400 text-xs px-3 py-1.5 rounded-lg max-w-md text-center italic" dangerouslySetInnerHTML={ msg.message ? { __html: msg.message } : undefined }>{!msg.message ? 'System update' : ''}</div></div> )}
                                        {msg.type === 'user' && ( <div className={cn("flex items-end gap-2", isCurrentUserSender && "flex-row-reverse")}> <Avatar className="w-7 h-7 flex-shrink-0 mb-1"><AvatarFallback className={cn("text-xs", isCurrentUserSender ? "bg-blue-800" : "bg-gray-700")}>{getInitials(msg.sender_username)}</AvatarFallback></Avatar> <div className="flex flex-col max-w-[75%]"> <div className={cn( "text-white px-3.5 py-2 rounded-xl text-sm break-words", isCurrentUserSender ? "bg-[#2a2d31] rounded-tr-none" : "bg-orange-600 rounded-tl-none" )}>{msg.message}</div> <div className={cn("mt-1 text-xs text-gray-500", isCurrentUserSender && "text-right")}> <Tooltip><TooltipTrigger asChild><span className="cursor-default">{new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></TooltipTrigger><TooltipContent><p>{new Date(msg.created_at).toLocaleString()}</p></TooltipContent></Tooltip> </div> </div> </div> )}
                                        {msg.type === 'wallet_card' && msg.wallet_address && ( <div className="flex justify-center my-3"><div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 max-w-md w-full"><div className="flex items-center justify-between mb-2"><div className="text-white font-medium text-sm flex items-center"><Lock className="h-4 w-4 mr-2 text-orange-500" /> Escrow Wallet Address</div></div><div className="bg-[#111] rounded p-2 flex items-center justify-between mb-3"><code className="text-gray-300 text-xs md:text-sm truncate">{msg.wallet_address}</code><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-orange-500" onClick={() => handleCopyToClipboard(msg.wallet_address)}><Copy className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Copy Address</p></TooltipContent></Tooltip></div><div className="flex items-center justify-between text-xs text-gray-400"><span>Network: {msg.wallet_network || 'Unknown'}</span><span className="flex items-center"><Shield className="h-3 w-3 mr-1 text-green-500" />Verified</span></div></div></div> )}
                                        {msg.type === 'transaction_card' && msg.transaction_hash && ( <div className="flex justify-center my-3"><div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 max-w-md w-full"><div className="flex items-center justify-between mb-3"><div className="text-white font-medium text-sm">Transaction Confirmed</div><Badge className="bg-green-500/10 text-green-400 border border-green-500/20"><Check className="h-3 w-3 mr-1"/>Confirmed</Badge></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-400">Tx Hash</span><span className="text-gray-300 flex items-center font-mono text-xs">{msg.transaction_hash.substring(0, 6)}...{msg.transaction_hash.substring(msg.transaction_hash.length - 4)} <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 ml-1 text-orange-500 hover:bg-orange-900/50"><ExternalLink className="h-3 w-3"/></Button></TooltipTrigger><TooltipContent>View on Explorer</TooltipContent></Tooltip></span></div><div className="flex justify-between"><span className="text-gray-400">From</span><span className="text-gray-300 font-mono text-xs">{msg.transaction_from?.substring(0, 6)}...</span></div><div className="flex justify-between"><span className="text-gray-400">To</span><span className="text-gray-300 font-mono text-xs">{msg.transaction_to?.substring(0, 6)}...</span></div><div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-white font-medium flex items-center gap-1.5"><span className="flex items-center h-4 w-4">{getCryptoIcon(msg.transaction_currency, 16)}</span>{msg.transaction_amount?.toLocaleString()} {msg.transaction_currency}</span></div>{msg.transaction_gas_fee && <div className="flex justify-between"><span className="text-gray-400">Gas Fee</span><span className="text-gray-300">{msg.transaction_gas_fee?.toFixed(5)} {msg.transaction_currency}</span></div>}</div></div></div> )}
                                        {msg.type === 'file' && msg.file_url && ( <div className={cn("flex items-end gap-2", isCurrentUserSender && "flex-row-reverse")}><Avatar className="w-7 h-7 flex-shrink-0 mb-1"><AvatarFallback className={cn("text-xs", isCurrentUserSender ? "bg-blue-800" : "bg-gray-700")}>{getInitials(msg.sender_username)}</AvatarFallback></Avatar><div className="flex flex-col max-w-[75%]"><Button variant="outline" className={cn( "px-3 py-2 h-auto rounded-xl text-sm border inline-flex items-center gap-2 group text-left justify-start", isCurrentUserSender ? "bg-[#2a2d31] rounded-tr-none border-gray-700 hover:border-gray-600 hover:bg-[#3a3d41]" : "bg-orange-700/50 rounded-tl-none border-orange-800/70 hover:border-orange-700 hover:bg-orange-700/60", isFileLoading && "opacity-70 cursor-wait" )} onClick={() => fetchAndOpenSignedUrl(msg.file_url)} disabled={isFileLoading} aria-label={`Download file ${msg.file_name || 'Attached File'}`} > {isFileLoading ? <Loader2 className="h-5 w-5 flex-shrink-0 text-gray-400 animate-spin" /> : <Paperclip className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-orange-400" />}<div className="flex flex-col overflow-hidden"><span className="truncate text-white group-hover:underline">{msg.file_name || "Attached File"}</span><span className="text-xs text-gray-400">{formatFileSize(msg.file_size)}</span></div>{!isFileLoading && <Download className="h-4 w-4 ml-auto text-gray-500 group-hover:text-white transition-colors"/>}</Button><div className={cn("mt-1 text-xs text-gray-500", isCurrentUserSender && "text-right")}> <Tooltip><TooltipTrigger asChild><span className="cursor-default">{new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></TooltipTrigger><TooltipContent><p>{new Date(msg.created_at).toLocaleString()}</p></TooltipContent></Tooltip> </div></div></div> )}
                                    </div> );
                                })}
                            </div>

                            {/* Chat input */}
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 flex items-center gap-2 flex-shrink-0">
  <input 
    type="file" 
    ref={fileInputRef} 
    onChange={handleFileSelect} 
    style={{ display: 'none' }} 
    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" 
  />
  
  <Tooltip>
    <TooltipTrigger asChild>
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="text-gray-400 hover:text-orange-500" 
        onClick={() => fileInputRef.current?.click()} 
        disabled={!!(isUploading || actionLoading || !canChat || !wsConnected)}
      >
        {isUploading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Paperclip className="h-5 w-5" />}
      </Button>
    </TooltipTrigger>
    <TooltipContent><p>Attach File</p></TooltipContent>
  </Tooltip>
  
  <Input 
    value={newMessage} 
    onChange={(e) => setNewMessage(e.target.value)} 
    className="flex-1 bg-[#2a2d31] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0 h-10" 
    placeholder={!canChat ? "Chat disabled" : (!wsConnected ? "Connecting chat..." : "Type a message...")} 
    disabled={!!(sendingMessage || actionLoading || !canChat || !wsConnected || isUploading)}
  />
  
  <Button 
    type="submit" 
    size="icon" 
    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full flex-shrink-0 w-10 h-10" 
    disabled={!newMessage.trim() || !!sendingMessage || !!actionLoading || !canChat || !wsConnected || !!isUploading}
  >
    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
  </Button>
</form>
                        </div>

                        {/* Right sidebar */}
                        <div className="w-80 border-l border-gray-800 flex-col hidden lg:flex overflow-y-auto">
                            <div className="p-4 border-b border-gray-800 flex-shrink-0"> <div className="text-white font-medium mb-1">Transaction Details</div> <div className="text-gray-400 text-sm">Escrow #{deal.deal_id}</div> </div>
                            <div className="p-4 space-y-6 flex-grow overflow-y-auto">
                                <div> <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Parties</h3> <div className="space-y-3"> <div className="flex items-center gap-3"> <Avatar className="w-9 h-9"> <AvatarFallback className="bg-gray-700 text-xs">{getInitials(deal.seller_username)}</AvatarFallback> </Avatar> <div> <div className="text-white text-sm">{deal.seller_username}</div> </div> <Badge variant={"secondary"} className="ml-auto bg-blue-900/50 text-blue-300 border border-blue-500/30">Seller</Badge> </div> <div className="flex items-center gap-3"> <Avatar className="w-9 h-9"> <AvatarFallback className={cn("text-xs", isCurrentUserBuyer ? "bg-green-800" : "bg-gray-700")}>{getInitials(deal.buyer_username)}</AvatarFallback> </Avatar> <div> <div className="text-white text-sm">{deal.buyer_username} {isCurrentUserBuyer ? '(You)' : ''}</div> </div> <Badge variant={"secondary"} className="ml-auto bg-green-900/50 text-green-300 border border-green-500/30">Buyer</Badge> </div> </div> </div>
                                <div className="border-t border-gray-800 pt-4"> <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Payment</h3> <div className="space-y-2"> <div className="flex justify-between text-sm"><span className="text-gray-400">Method</span><span className="text-white flex items-center gap-1.5"><span className="flex items-center h-4 w-4">{getCryptoIcon(deal.crypto_type, 16)}</span>{deal.crypto_type.toUpperCase()}</span></div> <div className="flex justify-between text-sm"><span className="text-gray-400">Amount</span><span className="text-white">{deal.amount.toLocaleString()} {deal.crypto_type.toUpperCase()}</span></div> <div className="flex justify-between text-sm"><span className="text-gray-400">USD Value</span><span className="text-white">{formatCurrency(deal.usd_value)}</span></div> <div className="flex justify-between text-sm"><span className="text-gray-400">Fee ({deal.fee_payer})</span><span className="text-white">{deal.fee_amount?.toLocaleString() || 'N/A'} {deal.crypto_type.toUpperCase()}</span></div> <div className="flex justify-between text-sm"><span className="text-gray-400">Status</span><span className={cn("font-medium", getStatusBadgeVariant(deal.status).variant === 'success' || getStatusBadgeVariant(deal.status).variant === 'info' ? 'text-green-400' : 'text-gray-300')}>{statusText}</span></div> </div> </div>
                                {isPayPalDeal && !['completed', 'canceled'].includes(deal.status) && ( <div className="border-t border-gray-800 pt-4"> <h3 className="text-yellow-400 font-medium mb-2 text-sm flex items-center gap-1.5"><Info size={16}/> Important Note</h3> <p className="text-xs text-yellow-300 bg-yellow-900/30 p-3 rounded border border-yellow-500/40"> PayPal transactions must be completed within 29 days due to platform limitations. </p> </div> )}
                                <div className="border-t border-gray-800 pt-4"> <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Support</h3> <div className="space-y-2"> <Button asChild variant="outline" className="w-full justify-start text-white border-gray-700 hover:bg-gray-800"> <Link href="/support"> <HelpCircle className="h-4 w-4 mr-2 text-orange-500" /> Get Support </Link> </Button> </div> </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}