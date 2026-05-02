import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/state/authSlice';
import businessReducer from '../../features/dashboard/state/businessSlice';
import conversationReducer from '../../features/conversations/state/conversationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    business: businessReducer,
    conversations: conversationReducer,
  },
});
