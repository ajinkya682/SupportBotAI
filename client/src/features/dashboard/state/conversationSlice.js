import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../shared/services/config';

const CONVERSATIONS_API = `${API_URL}/api/conversations`;

const initialState = {
  conversations: [],
  isLoading: false,
  isError: false,
  isFirstLoad: true,
  message: '',
};

const authHeader = (thunkAPI) => ({
  headers: { Authorization: `Bearer ${thunkAPI.getState().auth.user.token}` },
});

export const getConversations = createAsyncThunk('conversations/get', async (_, thunkAPI) => {
  try {
    const response = await axios.get(CONVERSATIONS_API, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const resolveConversation = createAsyncThunk('conversations/resolve', async (id, thunkAPI) => {
  try {
    const response = await axios.put(`${CONVERSATIONS_API}/${id}/resolve`, {}, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const toggleAi = createAsyncThunk('conversations/toggleAi', async (id, thunkAPI) => {
  try {
    const response = await axios.put(`${CONVERSATIONS_API}/${id}/toggle-ai`, {}, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendAgentReply = createAsyncThunk('conversations/reply', async ({ id, content }, thunkAPI) => {
  try {
    const response = await axios.post(`${CONVERSATIONS_API}/${id}/reply`, { content }, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    resetConversations: (state) => {
      state.conversations = [];
      state.isLoading = false;
      state.isError = false;
      state.isFirstLoad = true;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        if (state.isFirstLoad) {
          state.isLoading = true;
        }
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isFirstLoad = false;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(resolveConversation.fulfilled, (state, action) => {
        const index = state.conversations.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.conversations[index] = action.payload;
      })
      .addCase(toggleAi.fulfilled, (state, action) => {
        const index = state.conversations.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.conversations[index] = action.payload;
      })
      .addCase(sendAgentReply.fulfilled, (state, action) => {
        const index = state.conversations.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.conversations[index] = action.payload;
      })
      .addCase('auth/logout/fulfilled', (state) => {
        state.conversations = [];
        state.isLoading = false;
        state.isFirstLoad = true;
      });
  },
});

export const { resetConversations } = conversationSlice.actions;
export default conversationSlice.reducer;
