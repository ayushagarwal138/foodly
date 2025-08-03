import React, { useState, useEffect } from 'react';
import { api, API_ENDPOINTS } from '../config/api';

export default function UnreadMessageNotification({ userType = 'customer' }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const restaurantId = localStorage.getItem('restaurantId');

  const fetchUnreadCount = async () => {
    try {
      const params = userType === 'customer' 
        ? { customerId: userId }
        : { restaurantId: restaurantId };
      
      const data = await api.get(API_ENDPOINTS.SUPPORT_UNREAD_COUNT, {
        params: params
      });
      
      const count = userType === 'customer' 
        ? data.customerUnread || 0
        : data.restaurantUnread || 0;
      
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      
      // Poll for new unread messages every 10 seconds
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [userId, restaurantId, userType]);

  if (loading) return null;
  if (unreadCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-500 text-white px-3 py-2 rounded-full shadow-lg animate-pulse">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {unreadCount} {unreadCount === 1 ? 'message' : 'messages'}
          </span>
          <span className="text-xs">
            {userType === 'customer' ? 'from restaurant' : 'from customer'}
          </span>
        </div>
      </div>
    </div>
  );
} 