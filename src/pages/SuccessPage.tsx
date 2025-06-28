import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-sm sm:max-w-md mx-auto text-center">
        <div className="mb-6 sm:mb-8">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-sm sm:text-base px-2">Thank you for your order. We've received it and will start preparing your delicious meal.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2" />
            <span className="text-base sm:text-lg font-semibold text-gray-900">Estimated Time</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-orange-600 mb-2">15-20 minutes</p>
          <p className="text-xs sm:text-sm text-gray-600">Your order will be served at your table shortly</p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Button onClick={() => navigate('/menu')} className="w-full text-sm sm:text-base" size="sm">
            Order More Items
          </Button>
          <Button variant="outline" onClick={() => navigate('/menu')} className="w-full text-sm sm:text-base" size="sm">
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}