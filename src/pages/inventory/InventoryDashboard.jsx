import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiTrendingDown, FiClock, FiActivity, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// We import both the dedicated inventory API and the batches API for solid fallback logic
import inventoryApi from '../../api/inventoryApi';
import batchApi from '../../api/batchApi';

const InventoryDashboard = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [summary, setSummary] = useState({ totalBatches: 0, criticalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Strategy: We try to fetch from dedicated analytics endpoints first.
        // If they return 404 (because backend isn't fully wired yet), we seamlessly fallback
        // to calculating it directly from the /batches endpoint.
        let lowStock = [];
        let expSoon = [];
        let total = 0;

        try {
          const [lsData, expData, sumData] = await Promise.all([
            inventoryApi.getLowStock(100),
            inventoryApi.getExpiringSoon(30),
            inventoryApi.getSummary()
          ]);
          lowStock = lsData;
          expSoon = expData;
          total = sumData.totalBatches;
        } catch (apiErr) {
          // Fallback calculation via Batches CRUD if analytics endpoints aren't live
          console.warn('Analytics API unavailable. Calculating dashboard from raw batches...', apiErr);
          const rawBatches = await batchApi.getBatches();
          const batchList = Array.isArray(rawBatches) ? rawBatches : rawBatches.data || rawBatches.batches || [];
          
          total = batchList.length;
          
          // Fallback logic for low stock (< 100) and available
          lowStock = batchList.filter(b => b.quantity < 100 && b.status === 'Available');
          
          // Fallback logic for expiring in next 30 days
          const nextMonth = new Date();
          nextMonth.setDate(nextMonth.getDate() + 30);
          const today = new Date();
          
          expSoon = batchList.filter(b => {
             const expDate = new Date(b.expiryDate);
             return expDate > today && expDate <= nextMonth && b.status === 'Available';
          });
        }

        setLowStockItems(Array.isArray(lowStock) ? lowStock : lowStock.items || lowStock.batches || []);
        setExpiringSoon(Array.isArray(expSoon) ? expSoon : expSoon.items || expSoon.batches || []);
        setSummary({ totalBatches: total, criticalItems: lowStock.length });

      } catch (error) {
        toast.error('Failed to load inventory dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper formatting for names if object population exists
  const getName = (objOrId, fallback) => {
    if (!objOrId) return fallback;
    return objOrId.name ? objOrId.name : fallback;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <svg className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <FiActivity className="mr-3 text-danger-600 dark:text-danger-400" />
          Inventory Dashboard
        </h1>
        <p className="text-secondary-500 dark:text-slate-400 text-sm mt-1">Real-time alerts for low stock and expiring vaccines across hospitals.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col hover:border-red-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-secondary-600 dark:text-slate-400 uppercase tracking-wider">Critical Stock Levels</h3>
            <div className="p-2 bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 rounded-lg">
              <FiTrendingDown size={20} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-foreground">{lowStockItems.length}</div>
          <p className="text-sm text-danger-600 dark:text-danger-400 font-medium mt-2 flex items-center">
            <FiAlertTriangle className="mr-1" /> Requires immediate action
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-secondary-600 dark:text-slate-400 uppercase tracking-wider">Expiring in 30 Days</h3>
            <div className="p-2 bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400 rounded-lg">
              <FiClock size={20} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-foreground">{expiringSoon.length}</div>
          <p className="text-sm text-warning-600 dark:text-warning-400 font-medium mt-2 flex items-center">
            Review distribution routes
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-secondary-600 dark:text-slate-400 uppercase tracking-wider">Total Tracked Batches</h3>
            <div className="p-2 bg-blue-50 text-primary-600 dark:text-primary-400 rounded-lg">
              <FiPackage size={20} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-foreground">{summary.totalBatches || 0}</div>
          <Link to="/inventory/batches" className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-2 hover:underline">
            View full inventory →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="bg-danger-50 dark:bg-danger-500/10 px-6 py-4 border-b border-danger-200 dark:border-danger-900/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-danger-900 dark:text-danger-300 flex items-center">
              <FiAlertTriangle className="mr-2" /> Low Stock Warning (&lt; 100 units)
            </h2>
            <span className="bg-card text-danger-600 dark:text-danger-400 px-2 py-1 rounded-full text-xs font-bold border border-danger-200 dark:border-danger-900/50 shadow-sm">
              {lowStockItems.length} items
            </span>
          </div>
          
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-secondary-500 dark:text-slate-400 text-sm">Stock levels are healthy across all hospitals.</div>
            ) : (
              lowStockItems.map((item, idx) => (
                <div key={item._id || item.id || idx} className="p-5 hover:bg-secondary-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-foreground">{getName(item.vaccineId, 'Unknown Vaccine')}</h4>
                    <span className="text-danger-700 dark:text-danger-400 font-extrabold bg-danger-50 dark:bg-danger-500/10 px-3 py-1 rounded-full text-sm flex items-center">
                      {item.quantity} left
                    </span>
                  </div>
                  <div className="text-sm text-secondary-600 dark:text-slate-400 flex flex-col sm:flex-row sm:justify-between">
                    <span><strong>Hospital:</strong> {getName(item.hospitalId, 'Unknown Hospital')}</span>
                    <span className="font-mono text-xs text-secondary-400 dark:text-slate-500 mt-1 sm:mt-0">Batch #{item.batchNumber}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Soon Alerts */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="bg-warning-50 dark:bg-warning-500/10 px-6 py-4 border-b border-warning-200 dark:border-warning-900/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-warning-900 dark:text-warning-300 flex items-center">
              <FiClock className="mr-2" /> Expiring Soon (Next 30 Days)
            </h2>
            <span className="bg-card text-warning-600 dark:text-warning-400 px-2 py-1 rounded-full text-xs font-bold border border-warning-200 dark:border-warning-900/50 shadow-sm">
              {expiringSoon.length} items
            </span>
          </div>
          
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {expiringSoon.length === 0 ? (
              <div className="p-8 text-center text-secondary-500 dark:text-slate-400 text-sm">No batches mapped to expire in the next month.</div>
            ) : (
              expiringSoon.map((item, idx) => {
                // Calculate days remaining
                const expDate = new Date(item.expiryDate);
                const today = new Date();
                const diffTime = Math.abs(expDate - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={item._id || item.id || idx} className="p-5 hover:bg-secondary-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground">{getName(item.vaccineId, 'Unknown Vaccine')}</h4>
                      <span className="text-warning-700 dark:text-warning-400 font-bold bg-warning-50 dark:bg-warning-500/10 px-3 py-1 rounded-full text-sm">
                        {diffDays} days left
                      </span>
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-slate-400 flex flex-col">
                      <span><strong>Hospital:</strong> {getName(item.hospitalId, 'Unknown Hospital')}</span>
                      <div className="flex justify-between mt-1 text-xs">
                         <span className="font-mono text-secondary-500 dark:text-slate-400">Batch #{item.batchNumber} ({item.quantity} units)</span>
                         <span className="font-semibold text-warning-600 dark:text-warning-400">{expDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
