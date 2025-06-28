import React from 'react';
import { Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { MenuItem } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const { state, addItem, updateQuantity } = useCart();
  const cartItem = state.items.find(cartItem => cartItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (quantity === 0) {
      addItem(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <Card hover className="h-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col h-full">
          {/* Item Image */}
          {item.image_url ? (
            <div className="mb-3 sm:mb-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden h-32 sm:h-40 lg:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="mb-3 sm:mb-4 h-32 sm:h-40 lg:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg min-w-0 flex-1 pr-2">{item.name}</h3>
              {!item.available && (
                <Badge variant="error" className="text-xs flex-shrink-0">Sold Out</Badge>
              )}
            </div>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Badge variant="info" className="text-xs">{item.category}</Badge>
              <span className="text-lg sm:text-xl font-bold text-orange-600">₹{item.price}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {!item.available ? (
              <Button variant="secondary" className="w-full text-xs sm:text-sm" disabled size="sm">
                Currently Unavailable
              </Button>
            ) : quantity === 0 ? (
              <Button onClick={handleAdd} className="w-full text-xs sm:text-sm" size="sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <span className="mx-2 sm:mx-4 font-semibold text-base sm:text-lg">{quantity}</span>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}