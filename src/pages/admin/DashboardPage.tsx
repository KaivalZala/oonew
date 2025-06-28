import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, RotateCcw, AlertTriangle, Clock, ChefHat, CheckCircle } from 'lucide-react';
import { Order, supabase } from '../../lib/supabase';
import { OrderCard } from '../../components/admin/OrderCard';
import { StatsCard } from '../../components/admin/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

export function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    monthlyEarnings: 0,
    totalOrders: 0,
    activeTables: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    
    // Subscribe to real-time order updates with better error handling
    const subscription = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Immediately refresh both orders and stats
          fetchOrders();
          fetchStats();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Today's earnings
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfDay.toISOString())
        .neq('status', 'cancelled');

      // Monthly earnings
      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfMonth.toISOString())
        .neq('status', 'cancelled');

      // Total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'cancelled');

      // Active tables (unique table numbers from today)
      const { data: activeTables } = await supabase
        .from('orders')
        .select('table_number')
        .gte('created_at', startOfDay.toISOString())
        .neq('status', 'cancelled');

      // Pending orders count
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // In-progress orders count (accepted orders)
      const { count: inProgressOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');

      // Completed orders count
      const { count: completedOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const uniqueTables = new Set(activeTables?.map(order => order.table_number) || []);

      setStats({
        todayEarnings: todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0,
        monthlyEarnings: monthlyOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0,
        totalOrders: totalOrders || 0,
        activeTables: uniqueTables.size,
        pendingOrders: pendingOrders || 0,
        inProgressOrders: inProgressOrders || 0,
        completedOrders: completedOrders || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Optimistically update the local state first for immediate UI feedback
      setOrders(prevOrders => {
        if (status === 'completed') {
          return prevOrders.filter(order => order.id !== orderId);
        } else {
          return prevOrders.map(order => 
            order.id === orderId ? { ...order, status } : order
          );
        }
      });

      // Update stats optimistically
      setStats(prevStats => {
        const updatedStats = { ...prevStats };
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
          if (order.status === 'pending' && status === 'accepted') {
            updatedStats.pendingOrders = Math.max(0, updatedStats.pendingOrders - 1);
            updatedStats.inProgressOrders = updatedStats.inProgressOrders + 1;
          } else if (order.status === 'accepted' && status === 'completed') {
            updatedStats.inProgressOrders = Math.max(0, updatedStats.inProgressOrders - 1);
            updatedStats.completedOrders = updatedStats.completedOrders + 1;
          } else if (order.status === 'pending' && status === 'cancelled') {
            updatedStats.pendingOrders = Math.max(0, updatedStats.pendingOrders - 1);
          }
        }
        
        return updatedStats;
      });

      // Then update the database
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        // If database update fails, revert the optimistic update
        console.error('Error updating order status:', error);
        await fetchOrders();
        await fetchStats();
        throw error;
      }

      // Fetch fresh data to ensure consistency (this will also trigger via real-time)
      setTimeout(() => {
        fetchOrders();
        fetchStats();
      }, 100);

    } catch (error) {
      console.error('Error updating order status:', error);
      // The optimistic update will be reverted by the fetch calls above
    }
  };

  const handleResetData = async () => {
    setResetting(true);
    try {
      // Delete all orders
      const { error } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;

      // Immediately update local state
      setOrders([]);
      setStats({
        todayEarnings: 0,
        monthlyEarnings: 0,
        totalOrders: 0,
        activeTables: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0
      });

      // Refresh data from database
      await fetchOrders();
      await fetchStats();
      
      setShowResetConfirm(false);
      alert('All data has been reset successfully!');
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const acceptedOrders = orders.filter(order => order.status === 'accepted');

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-base lg:text-lg text-gray-600 mt-1">Monitor your restaurant's performance</p>
          </div>
          
          {/* Reset Button */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 px-4 py-2"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Confirm Reset</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Are you sure you want to reset all data? This will permanently delete:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                  <li>All orders (pending, accepted, completed, cancelled)</li>
                  <li>All earnings data</li>
                  <li>All statistics</li>
                </ul>
                <p className="text-red-600 text-sm font-medium mb-6">
                  This action cannot be undone!
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button
                    onClick={handleResetData}
                    disabled={resetting}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base"
                    size="sm"
                  >
                    {resetting ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Resetting...
                      </>
                    ) : (
                      'Yes, Reset All Data'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                    disabled={resetting}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Grid - Exactly like your image */}
        <div className="space-y-6 mb-8">
          {/* First Row - Earnings and Total Orders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Today's Earnings"
              value={`₹${stats.todayEarnings.toFixed(2)}`}
              icon={DollarSign}
              color="bg-green-500"
            />
            <StatsCard
              title="Monthly Earnings"
              value={`₹${stats.monthlyEarnings.toFixed(2)}`}
              icon={TrendingUp}
              color="bg-blue-500"
            />
            <StatsCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingBag}
              color="bg-purple-500"
            />
          </div>

          {/* Second Row - Active Tables, Pending, In Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Active Tables"
              value={stats.activeTables}
              icon={Users}
              color="bg-orange-500"
            />
            <StatsCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={Clock}
              color="bg-yellow-500"
            />
            <StatsCard
              title="In Progress"
              value={stats.inProgressOrders}
              icon={ChefHat}
              color="bg-blue-600"
            />
          </div>

          {/* Third Row - Completed (single card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Completed"
              value={stats.completedOrders}
              icon={CheckCircle}
              color="bg-green-600"
            />
          </div>
        </div>

        {/* Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Pending Orders */}
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-6">
              Pending Orders ({pendingOrders.length})
            </h2>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-base lg:text-lg">
                No pending orders
              </div>
            ) : (
              <div className="space-y-6">
                {pendingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Accepted Orders */}
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-6">
              In Progress ({acceptedOrders.length})
            </h2>
            {acceptedOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-base lg:text-lg">
                No orders in progress
              </div>
            ) : (
              <div className="space-y-6">
                {acceptedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}