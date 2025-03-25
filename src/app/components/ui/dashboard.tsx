"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  ChevronDown,
  CreditCard,
  Eye,
  LogOut,
  Menu,
  Shield,
  User,
  Users,
  Wallet,
  X,
  BarChart3,
  Zap,
  FileText,
  Settings,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [progressValues, setProgressValues] = useState({
    escrow1: 0,
    escrow2: 0,
    escrow3: 0,
  })
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  // Animate progress bars when content loads
  useEffect(() => {
    if (!loading) {
      setProgressValues({
        escrow1: 66,
        escrow2: 25,
        escrow3: 60,
      })
    }
  }, [loading])

  // Circular stats for dashboard
  const circularStats = [
    { title: "Completed", value: 156, percent: 78, color: "#ff5722" },
    { title: "Pending", value: 12, percent: 12, color: "#ffab00" },
    { title: "Failed", value: 4, percent: 10, color: "#f44336" },
  ]

  return (
    <div className="min-h-screen bg-black text-gray-100 overflow-x-hidden">
      {/* Cyberpunk grid background with animation */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] grid-rows-[repeat(auto-fill,minmax(5rem,1fr))]">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className={`border-[0.5px] border-orange-500/10 ${i % 7 === 0 ? "bg-orange-500/5 animate-pulse" : ""}`}
            ></div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-orange-900/10"></div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-black border-r border-orange-500/20 z-50 transition-all duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-5 border-b border-orange-500/20">
          <div className="flex items-center gap-3">

    <img
  src="/logo.png"
  alt=""
  className="h-10 w-10 rounded-lg object-contain"
/>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
                Medius
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-orange-500 hover:text-orange-300 hover:bg-orange-500/10 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="py-5">
          <div className="px-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-black border border-orange-500/30 text-gray-300 h-10 px-4 pr-10 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200 placeholder:text-gray-500"
              />
              <div className="absolute right-3 top-3 text-orange-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-2 px-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Navigation</h3>
          </div>

          <nav className="space-y-1 px-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-all duration-200 hover:translate-x-1 h-11 rounded-lg"
            >
              <CreditCard className="h-5 w-5" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-200 hover:translate-x-1 h-11 rounded-lg"
            >
              <CircleDollarSign className="h-5 w-5" />
              <span>My Escrows</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-200 hover:translate-x-1 h-11 rounded-lg"
            >
              <FileText className="h-5 w-5" />
              <span>Contracts</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-200 hover:translate-x-1 h-11 rounded-lg"
            >
              <Users className="h-5 w-5" />
              <span>Contacts</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-200 hover:translate-x-1 h-11 rounded-lg"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Analytics</span>
            </Button>
          </nav>

          <div className="mt-8 mb-2 px-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
          </div>

          <nav className="space-y-1 px-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-200 hover:translate-x-1 h-11 rounded-lg"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-200 hover:translate-x-1 h-11 rounded-lg"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-orange-500/20">
          <div className="flex items-center gap-3 mb-5">
            <Avatar className="h-10 w-10 border-2 border-orange-500/30 mr-4">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-orange-500/10 text-orange-500">N</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">Adam Zaki</div>
              
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-center gap-2 text-orange-500 border-orange-500/30 hover:bg-orange-500/10 transition-all duration-200 h-11 ml-4"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-orange-500 hover:text-orange-300 hover:bg-orange-500/10 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold hidden sm:block text-white">Dashboard Overview</h1>
            </div>

            <div className="flex items-center gap-4">
              <Button className="h-10 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-black hover:from-orange-500 hover:to-orange-400 shadow-[0_0_15px_rgba(255,87,34,0.3)] hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] transition-all duration-300 border-0">
                <Zap className="h-4 w-4 mr-2" />
                New Escrow
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="relative border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 transition-colors duration-200 text-gray-300 h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-xs flex items-center justify-center text-black animate-pulse">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-orange-500/10 transition-colors duration-200 text-gray-300 h-10"
                  >
                    <Avatar className="h-8 w-8 border-2 border-orange-500/30">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-orange-500/10 text-orange-500">JD</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block font-medium">Adam Zaki</span>
                    <ChevronDown className="h-4 w-4 text-orange-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-orange-500/30 text-gray-300">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-orange-500/20" />
                  <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer transition-colors duration-200 focus:bg-orange-500/10 focus:text-orange-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer transition-colors duration-200 focus:bg-orange-500/10 focus:text-orange-500">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer transition-colors duration-200 focus:bg-orange-500/10 focus:text-orange-500">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-500/20" />
                  <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer transition-colors duration-200 focus:bg-orange-500/10 focus:text-orange-500">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-5 md:p-6 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="relative w-24 h-24">
                {/* Inner spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>

                {/* Outer glowing ring */}
                <div className="absolute -inset-4 rounded-full border border-orange-500/10 animate-pulse"></div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-orange-500 animate-pulse" />
                </div>
              </div>
              <p className="mt-8 text-xl text-orange-500 animate-pulse font-light tracking-wider">
                INITIALIZING SECURE CONNECTION
              </p>
              <div className="mt-4 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 animate-[loading_1.5s_ease-in-out_infinite]"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Welcome section */}
              <div className="mb-8">
                <h2 className="text-2xl font-light text-white mb-1">
                  Welcome back, <span className="font-semibold text-orange-500">Adam</span>
                </h2>
                <p className="text-gray-500">Here's what's happening with your escrow transactions today.</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="flex">
                  <div
                    className="w-full bg-black border border-orange-500/20 rounded-xl overflow-hidden group hover:border-orange-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,87,34,0.15)]"
                    onMouseEnter={() => setHoveredCard(1)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Total Balance</p>
                          <h3 className="text-2xl font-bold text-white">4.218 BTC</h3>
                          <p className="text-sm text-green-400 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +2.5% from last week
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                          <Wallet className="h-6 w-6 text-orange-500" />
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-orange-500/10">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Portfolio value</span>
                          <span className="text-white">$143,921</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000 ease-out`}
                            style={{ width: hoveredCard === 1 ? "75%" : "0%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <div
                    className="w-full bg-black border border-orange-500/20 rounded-xl overflow-hidden group hover:border-orange-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,87,34,0.15)]"
                    onMouseEnter={() => setHoveredCard(2)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Active Escrows</p>
                          <h3 className="text-2xl font-bold text-white">12</h3>
                          <p className="text-sm text-orange-500 mt-1 flex items-center">3 pending release</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                          <CircleDollarSign className="h-6 w-6 text-orange-500" />
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-orange-500/10">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Success rate</span>
                          <span className="text-white">97.5%</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000 ease-out`}
                            style={{ width: hoveredCard === 2 ? "97%" : "0%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Stats with Circular Progress */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                <div className="bg-black border border-orange-500/20 rounded-xl p-5 col-span-1 md:col-span-1">
                  <h3 className="text-lg font-medium mb-4 text-white">Transaction Stats</h3>
                  <div className="space-y-6">
                    {circularStats.map((stat, index) => (
                      <div key={index} className="flex items-center">
                        <div className="relative w-16 h-16 mr-4">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#333" strokeWidth="10" />
                            {/* Progress circle with animation */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke={stat.color}
                              strokeWidth="10"
                              strokeDasharray={`${stat.percent * 2.51} 251`}
                              strokeDashoffset="0"
                              transform="rotate(-90 50 50)"
                              className="animate-[circleProgress_1.5s_ease-out_forwards]"
                              style={{
                                strokeDasharray: "251 251",
                                animation: `circleProgress${index} 1.5s ease-out forwards`,
                              }}
                            />
                            <style>
                              {`
                                @keyframes circleProgress${index} {
                                  to {
                                    stroke-dasharray: ${stat.percent * 2.51} 251;
                                  }
                                }
                              `}
                            </style>
                            {/* Center text */}
                            <text
                              x="50"
                              y="50"
                              textAnchor="middle"
                              dy=".3em"
                              fontSize="20"
                              fill="white"
                              fontWeight="bold"
                            >
                              {stat.percent}%
                            </text>
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">{stat.title}</p>
                          <p className="text-xl font-semibold text-white">{stat.value}</p>
                          <p className="text-xs text-gray-500">Transactions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black border border-orange-500/20 rounded-xl overflow-hidden col-span-1 md:col-span-3">
                  <div className="p-5 border-b border-orange-500/20">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Recent Transactions</h3>
                      <Button
                        variant="ghost"
                        className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-200"
                      >
                        View All
                      </Button>
                    </div>
                  </div>
                  <div className="px-5 divide-y divide-orange-500/10">
                    {[
                      {
                        id: "ESC-1043",
                        title: "NFT Purchase Agreement",
                        date: "2 hours ago",
                        party: "Ben Dover",
                        amount: "0.85 ETH",
                        status: "Pending",
                      },
                      {
                        id: "ESC-1042",
                        title: "DeFi Development Contract",
                        date: "5 hours ago",
                        party: "Hugh Jass",
                        amount: "2.4 BTC",
                        status: "In Progress",
                      },
                      {
                        id: "ESC-1041",
                        title: "Exchange Escrow",
                        date: "8 hours ago",
                        party: "Ali Fergany",
                        amount: "15,000 USDC",
                        status: "Completed",
                      },
                      {
                        id: "ESC-1040",
                        title: "Software Development",
                        date: "1 day ago",
                        party: "Yazeed Albatran",
                        amount: "1.2 ETH",
                        status: "Completed",
                      },
                    ].map((tx, i) => (
                      <div key={i} className="py-4 group hover:bg-orange-500/5 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3 border border-orange-500/30">
                              <AvatarFallback className="bg-orange-500/10 text-orange-500 text-xs">
                                {tx.party
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-white">{tx.title}</p>
                                <p className="text-gray-500 text-xs ml-2">#{tx.id}</p>
                              </div>
                              <p className="text-gray-500 text-sm flex items-center">
                                <span>{tx.party}</span>
                                <span className="mx-2">•</span>
                                <span>{tx.date}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium text-orange-500">{tx.amount}</p>
                              <Badge
                                className={
                                  tx.status === "Completed"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : tx.status === "Pending"
                                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                      : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                }
                              >
                                {tx.status}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs section */}
              <Tabs defaultValue="active" className="mb-8">
                <TabsList className="bg-black border border-orange-500/20 p-1 rounded-lg">
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-200 text-gray-300 data-[state=active]:shadow-[0_0_15px_rgba(255,87,34,0.5)] rounded px-4 py-2"
                  >
                    Active Escrows
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-200 text-gray-300 data-[state=active]:shadow-[0_0_15px_rgba(255,87,34,0.5)] rounded px-4 py-2"
                  >
                    Transaction History
                  </TabsTrigger>
                  <TabsTrigger
                    value="contacts"
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-black transition-all duration-200 text-gray-300 data-[state=active]:shadow-[0_0_15px_rgba(255,87,34,0.5)] rounded px-4 py-2"
                  >
                    Trusted Contacts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6 space-y-5">
                  {/* Active escrow cards */}
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="bg-black border-orange-500/20 overflow-hidden hover:shadow-[0_0_20px_rgba(255,87,34,0.2)] transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-orange-500 text-black hover:bg-orange-600 transition-colors duration-200">
                                In Progress
                              </Badge>
                              <span className="text-sm text-gray-500">ID: ESC-{1000 + i}</span>
                            </div>
                            <span className="text-sm text-gray-500">Created: May {10 + i}, 2023</span>
                          </div>

                          <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-orange-500 transition-colors duration-200">
                            {i === 1
                              ? "NFT Purchase Agreement"
                              : i === 2
                                ? "DeFi Development Contract"
                                : "Exchange Escrow"}
                          </h3>

                          <div className="flex items-center gap-2 mb-4">
                            <Avatar className="h-7 w-7 border border-orange-500/30">
                              <AvatarFallback className="bg-orange-500/10 text-orange-500 text-xs">
                                {i === 1 ? "AK" : i === 2 ? "BL" : "CM"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-300">
                              {i === 1 ? "Alex Kim" : i === 2 ? "Blake Lee" : "Chris Moore"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-all duration-200">
                              <p className="text-gray-500 mb-1">Amount</p>
                              <p className="font-medium text-orange-500">
                                {i === 1 ? "0.85 ETH" : i === 2 ? "2.4 BTC" : "15,000 USDC"}
                              </p>
                            </div>
                            <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-all duration-200">
                              <p className="text-gray-500 mb-1">Release Date</p>
                              <p className="font-medium text-white">
                                {i === 1 ? "May 25, 2023" : i === 2 ? "June 15, 2023" : "May 30, 2023"}
                              </p>
                            </div>
                            <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-all duration-200">
                              <p className="text-gray-500 mb-1">Status</p>
                              <p className="font-medium text-white">
                                {i === 1 ? "Awaiting Delivery" : i === 2 ? "In Review" : "Pending Confirmation"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col justify-end gap-3 p-5 bg-gradient-to-b from-black to-orange-950/20 md:border-l border-orange-500/20 md:min-w-[200px]">
                          <Button className="bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(255,87,34,0.3)] hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] transition-all duration-300 hover:translate-y-[-2px] w-full justify-center">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200 w-full justify-center"
                          >
                            Release Funds
                          </Button>
                        </div>
                      </div>

                      <div className="px-5 py-3 bg-gradient-to-r from-orange-950/10 to-black border-t border-orange-500/20">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Progress:</span>
                            <span className="text-xs font-medium text-gray-300">
                              {i === 1
                                ? "2 of 3 conditions met"
                                : i === 2
                                  ? "1 of 4 conditions met"
                                  : "3 of 5 conditions met"}
                            </span>
                          </div>
                          <Progress
                            value={
                              i === 1
                                ? progressValues.escrow1
                                : i === 2
                                  ? progressValues.escrow2
                                  : progressValues.escrow3
                            }
                            className="w-24 h-1.5 bg-gray-800"
                          >
                            <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" />
                          </Progress>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <Card className="bg-black border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,87,34,0.2)] transition-all duration-300">
                    <CardHeader className="border-b border-orange-500/20">
                      <CardTitle className="text-white">Transaction History</CardTitle>
                      <CardDescription className="text-gray-500">
                        View your completed and canceled escrow transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-orange-950/20 to-black">
                                <th className="px-6 py-4 text-left font-medium text-gray-500">ID</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Date</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Counterparty</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Amount</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Status</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-500/10">
                              {[
                                {
                                  id: "ESC-985",
                                  date: "May 8, 2023",
                                  party: "Sarah Johnson",
                                  amount: "1.2 ETH",
                                  status: "Completed",
                                },
                                {
                                  id: "ESC-972",
                                  date: "May 2, 2023",
                                  party: "David Chen",
                                  amount: "0.5 BTC",
                                  status: "Completed",
                                },
                                {
                                  id: "ESC-965",
                                  date: "Apr 28, 2023",
                                  party: "Maria Garcia",
                                  amount: "5,000 USDC",
                                  status: "Canceled",
                                },
                                {
                                  id: "ESC-954",
                                  date: "Apr 20, 2023",
                                  party: "James Wilson",
                                  amount: "0.75 ETH",
                                  status: "Completed",
                                },
                                {
                                  id: "ESC-943",
                                  date: "Apr 15, 2023",
                                  party: "Emma Brown",
                                  amount: "1.8 BTC",
                                  status: "Completed",
                                },
                              ].map((tx, i) => (
                                <tr key={i} className="hover:bg-orange-500/5 transition-colors duration-150 group">
                                  <td className="px-6 py-4 text-orange-500">{tx.id}</td>
                                  <td className="px-6 py-4 text-gray-300">{tx.date}</td>
                                  <td className="px-6 py-4 text-gray-300">{tx.party}</td>
                                  <td className="px-6 py-4 text-gray-300">{tx.amount}</td>
                                  <td className="px-6 py-4">
                                    <Badge
                                      className={
                                        tx.status === "Completed"
                                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                                      }
                                    >
                                      {tx.status}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-orange-500/20 p-4">
                      <Button
                        variant="outline"
                        className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Page 1 of 5</span>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200"
                      >
                        Next
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="contacts" className="mt-6">
                  <Card className="bg-black border-orange-500/20 hover:shadow-[0_0_20px_rgba(255,87,34,0.2)] transition-all duration-300">
                    <CardHeader className="border-b border-orange-500/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-white">Trusted Contacts</CardTitle>
                          <CardDescription className="text-gray-500">
                            Manage your trusted contacts for quick escrow setup
                          </CardDescription>
                        </div>
                        <Button className="bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(255,87,34,0.3)] hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] transition-all duration-300">
                          <span className="text-xl mr-1">+</span> Add Contact
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                          { name: "Alex Kim", wallet: "0x71C...93E4", txCount: 8 },
                          { name: "Blake Lee", wallet: "0x45A...F721", txCount: 5 },
                          { name: "Chris Moore", wallet: "0x92B...12D8", txCount: 3 },
                          { name: "Sarah Johnson", wallet: "0x38F...A4C2", txCount: 12 },
                          { name: "David Chen", wallet: "0x67D...B3E9", txCount: 7 },
                          { name: "Maria Garcia", wallet: "0x19C...45F7", txCount: 4 },
                        ].map((contact, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-br from-black to-orange-950/10 border border-orange-500/20 rounded-xl p-5 hover:shadow-[0_0_15px_rgba(255,87,34,0.2)] transition-all duration-300 hover:-translate-y-1 group"
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <Avatar className="h-12 w-12 border-2 border-orange-500/30">
                                <AvatarFallback className="bg-orange-500/10 text-orange-500">
                                  {contact.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-white group-hover:text-orange-500 transition-colors duration-200">
                                  {contact.name}
                                </h4>
                                <div className="flex items-center">
                                  <p className="text-xs text-gray-500">{contact.wallet}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 ml-1 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10"
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M8 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21H17C18.1046 21 19 20.1046 19 19V16M9 15H13L21 7L17 3L9 11V15Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4 p-3 bg-orange-500/5 rounded-lg border border-orange-500/10">
                              <div className="flex justify-between items-center">
                                <div className="text-gray-500 text-sm">Transaction count</div>
                                <div className="text-orange-500 font-medium">{contact.txCount}</div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button className="flex-1 bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_10px_rgba(255,87,34,0.3)] hover:shadow-[0_0_15px_rgba(255,87,34,0.5)] transition-all duration-300">
                                New Escrow
                              </Button>
                              <Button
                                variant="outline"
                                className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200"
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-orange-500/20 p-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">© 2023 Medius. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors duration-200 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors duration-200 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors duration-200 text-sm">
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}