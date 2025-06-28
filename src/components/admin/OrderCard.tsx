import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Order } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="flex items-center space-x-1 text-orange-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">Table {order.table_number}</span>
            </div>
            <Badge variant={getStatusColor(order.status)} className="text-xs">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 text-xs sm:text-sm flex-shrink-0">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{formatTime(order.created_at)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-900 min-w-0 flex-1 pr-2">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-600 flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {order.customer_notes && (
          <div className="mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Note:</strong> {order.customer_notes}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="text-base sm:text-lg font-bold text-gray-900">
            Total: ₹{order.total.toFixed(2)}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {order.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'accepted')}
                  className="text-xs sm:text-sm"
                >
                  Accept
                </Button>
              </>
            )}
            {order.status === 'accepted' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className="text-xs sm:text-sm"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}