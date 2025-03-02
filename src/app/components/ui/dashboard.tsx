"use client"
import React, { useState } from 'react';
import { Activity, Shield, User, RefreshCw, Clock, DollarSign, Settings, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

const MediusDashboard = () => {
  const { userId } = useAuth();
  
  if (!userId) {
    return <div>Unauthorized</div>;
  }
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen w-full bg-black text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black border-r border-gray-800 p-4">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-8 h-8">
            <img src="/cropped_image.png" alt="Medius Logo" className="w-full h-full" />
          </div>
          <span className="font-bold text-lg">Medius</span>
        </div>
        <nav className="flex flex-col gap-4">
          <button 
            className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'overview' ? 'bg-orange-500 text-white' : 'bg-black text-gray-300'}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={20} />
            <span>Overview</span>
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'transactions' ? 'bg-orange-500 text-white' : 'bg-black text-gray-300'}`}
            onClick={() => setActiveTab('transactions')}
          >
            <RefreshCw size={20} />
            <span>Trades</span>
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'protection' ? 'bg-orange-500 text-white' : 'bg-black text-gray-300'}`}
            onClick={() => setActiveTab('protection')}
          >
            <Shield size={20} />
            <span>Protection</span>
          </button>
          <button 
            className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-orange-500 text-white' : 'bg-black text-gray-300'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            
            <span className="font-bold text-lg">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-black border border-gray-800 rounded-full p-2">
              <Settings size={18} />
            </button>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto p-4">
          {/* Wallet Info */}
          <div className="bg-black border border-gray-800 rounded-lg p-4 mb-6 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400 mb-1">Your Volume</div>
                <div className="text-3xl font-bold text-white mb-1">$47,590</div>
                <div className="flex items-center text-sm text-gray-400">
                  <span className="text-orange-500 mr-1">↑ 7.46%</span> from last month
                </div>
              </div>
              <div className="bg-orange-500/10 p-4 rounded-full">
                <DollarSign size={24} className="text-orange-500" />
              </div>
            </div>
          </div>
          
          {/* Dashboard Tabs */}
          <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === 'overview' ? 'bg-orange-500 text-white' : 'bg-black border border-gray-800 text-gray-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === 'transactions' ? 'bg-orange-500 text-white' : 'bg-black border border-gray-800 text-gray-300'}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === 'middleman' ? 'bg-orange-500 text-white' : 'bg-black border border-gray-800 text-gray-300'}`}
              onClick={() => setActiveTab('middleman')}
            >
              Middleman
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === 'protection' ? 'bg-orange-500 text-white' : 'bg-black border border-gray-800 text-gray-300'}`}
              onClick={() => setActiveTab('protection')}
            >
              Protection
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black border border-gray-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-orange-500" />
                <div className="text-sm text-gray-400">Active Deals</div>
              </div>
              <div className="text-2xl font-bold">23</div>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-orange-500" />
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="text-2xl font-bold">147</div>
            </div>
          </div>
          
          {/* Performance Graph */}
          <div className="bg-black border border-gray-800 rounded-lg p-4 mb-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold">Performance</h3>
                <div className="text-sm text-gray-400">Transaction growth</div>
              </div>
              <div className="flex">
                <button className="text-xs border-b-2 border-transparent text-gray-400 pb-1 px-2">W</button>
                <button className="text-xs border-b-2 border-transparent text-gray-400 pb-1 px-2">M</button>
                <button className="text-xs border-b-2 border-orange-500 text-white pb-1 px-2">Y</button>
              </div>
            </div>
            
            {/* Graph Area */}
            <div className="relative h-40 mb-4">
              <svg className="w-full h-full" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,70 C20,65 40,60 60,55 C80,50 100,45 120,35 C140,25 160,30 180,25 C200,20 220,15 240,10 C260,5 280,15 300,20" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="2"
                />
                <path 
                  d="M0,70 C20,65 40,60 60,55 C80,50 100,45 120,35 C140,25 160,30 180,25 C200,20 220,15 240,10 C260,5 280,15 300,20 L300,100 L0,100 Z" 
                  fill="url(#orangeGradient)"
                />
                <circle cx="300" cy="20" r="4" fill="#f97316" />
              </svg>
            </div>
            
            <div className="text-xs text-gray-500 flex justify-between mb-2">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-400">
                Total Volume: <span className="text-white">$1.47M</span>
              </div>
              <div className="text-orange-500 font-bold text-sm bg-orange-500/10 px-3 py-1 rounded-full">
                +12.7%
              </div>
            </div>
          </div>
          
          {/* Safety Features */}
          <div className="bg-black border border-gray-800 rounded-lg p-4 mb-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  <Shield size={16} className="text-orange-500" />
                  Medius Protection
                </h3>
              </div>
              <button className="text-xs bg-black border border-gray-800 px-3 py-1 rounded-full">
                Configure
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <span>Escrow Protection</span>
                    <span className="bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full text-xs">Active</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Funds held securely until delivery</div>
                </div>
                <div className="text-orange-500">
                  <Eye size={18} />
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <span>Verification System</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Identity verification for all parties</div>
                </div>
                <div>
                  <button className="bg-orange-500 px-3 py-1 rounded-full text-xs">Enable</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-black border border-gray-800 rounded-lg p-4 shadow-lg mb-16">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Recent Transactions</h3>
              <button className="text-xs text-orange-500">View all</button>
            </div>
            
            <div className="space-y-4">
              {[
                {id: "M-9385", time: "2h ago", amount: "$879.50", status: "completed"},
                {id: "M-8245", time: "5h ago", amount: "$1,243.00", status: "pending"},
                {id: "M-7652", time: "1d ago", amount: "$425.75", status: "completed"}
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border-b border-gray-800 last:border-0 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${item.status === "completed" ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
                      {item.status === "completed" ? 
                        <CheckCircle size={16} className="text-green-500" /> : 
                        <AlertTriangle size={16} className="text-yellow-500" />
                      }
                    </div>
                    <div>
                      <div className="font-medium">{item.id}</div>
                      <div className="text-xs text-gray-400">{item.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.amount}</div>
                    <div className={`text-xs ${item.status === "completed" ? "text-green-500" : "text-yellow-500"}`}>
                      {item.status === "completed" ? "Completed" : "Pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MediusDashboard;
