import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../shared/services/config';

const BUSINESS_API = `${API_URL}/business`;

const initialState = {
  business: null,
  notifications: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const authHeader = (thunkAPI) => ({
  headers: { Authorization: `Bearer ${thunkAPI.getState().auth.user.token}` },
});

export const getBusiness = createAsyncThunk('business/get', async (_, thunkAPI) => {
  try {
    const response = await axios.get(BUSINESS_API, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateBusiness = createAsyncThunk('business/update', async (businessData, thunkAPI) => {
  try {
    const response = await axios.patch(BUSINESS_API, businessData, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getNotifications = createAsyncThunk('business/getNotifications', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${BUSINESS_API}/notifications`, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const markNotificationsRead = createAsyncThunk('business/readNotifications', async (_, thunkAPI) => {
  try {
    const response = await axios.patch(`${BUSINESS_API}/notifications/read`, {}, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const scrapeWebsite = createAsyncThunk('business/scrape', async (url, thunkAPI) => {
  try {
    const response = await axios.post(`${BUSINESS_API}/scrape`, { url }, authHeader(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    resetBusiness: (state) => {
      state.business = null;
      state.notifications = [];
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBusiness.pending, (state) => {
        if (!state.business) {
          state.isLoading = true;
        }
      })
      .addCase(getBusiness.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.business = action.payload;
        state.notifications = action.payload.notifications || [];
      })
      .addCase(getBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        state.isLoading = false;
        state.business = action.payload;
      })
      .addCase(scrapeWebsite.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(scrapeWebsite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.business = action.payload.business;
      })
      .addCase(scrapeWebsite.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      })
      .addCase('auth/logout/fulfilled', (state) => {
        state.business = null;
        state.notifications = [];
        state.isLoading = false;
        state.isSuccess = false;
      });
  },
});

export const { resetBusiness } = businessSlice.actions;
export default businessSlice.reducer;
