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
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiActivity className="mr-3 text-red-600" />
          Inventory Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Real-time alerts for low stock and expiring vaccines across hospitals.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-red-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Critical Stock Levels</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <FiTrendingDown size={20} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-gray-900">{lowStockItems.length}</div>
          <p className="text-sm text-red-600 font-medium mt-2 flex items-center">
            <FiAlertTriangle className="mr-1" /> Requires immediate action
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Expiring in 30 Days</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <FiClock size={20} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-gray-900">{expiringSoon.length}</div>
          <p className="text-sm text-orange-600 font-medium mt-2 flex items-center">
            Review distribution routes
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Tracked Batches</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FiPackage size={20} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-gray-900">{summary.totalBatches || 0}</div>
          <Link to="/inventory/batches" className="text-sm text-blue-600 font-medium mt-2 hover:underline">
            View full inventory →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-red-900 flex items-center">
              <FiAlertTriangle className="mr-2" /> Low Stock Warning (&lt; 100 units)
            </h2>
            <span className="bg-white text-red-600 px-2 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm">
              {lowStockItems.length} items
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Stock levels are healthy across all hospitals.</div>
            ) : (
              lowStockItems.map((item, idx) => (
                <div key={item._id || item.id || idx} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{getName(item.vaccineId, 'Unknown Vaccine')}</h4>
                    <span className="text-red-700 font-extrabold bg-red-100 px-3 py-1 rounded-full text-sm flex items-center">
                      {item.quantity} left
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between">
                    <span><strong>Hospital:</strong> {getName(item.hospitalId, 'Unknown Hospital')}</span>
                    <span className="font-mono text-xs text-gray-400 mt-1 sm:mt-0">Batch #{item.batchNumber}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Soon Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-orange-900 flex items-center">
              <FiClock className="mr-2" /> Expiring Soon (Next 30 Days)
            </h2>
            <span className="bg-white text-orange-600 px-2 py-1 rounded-full text-xs font-bold border border-orange-200 shadow-sm">
              {expiringSoon.length} items
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {expiringSoon.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No batches mapped to expire in the next month.</div>
            ) : (
              expiringSoon.map((item, idx) => {
                // Calculate days remaining
                const expDate = new Date(item.expiryDate);
                const today = new Date();
                const diffTime = Math.abs(expDate - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={item._id || item.id || idx} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{getName(item.vaccineId, 'Unknown Vaccine')}</h4>
                      <span className="text-orange-700 font-bold bg-orange-100 px-3 py-1 rounded-full text-sm">
                        {diffDays} days left
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex flex-col">
                      <span><strong>Hospital:</strong> {getName(item.hospitalId, 'Unknown Hospital')}</span>
                      <div className="flex justify-between mt-1 text-xs">
                         <span className="font-mono text-gray-500">Batch #{item.batchNumber} ({item.quantity} units)</span>
                         <span className="font-semibold text-orange-600">{expDate.toLocaleDateString()}</span>
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
