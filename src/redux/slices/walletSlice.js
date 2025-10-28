import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import walletAPI from '../../api/walletAPI';

// Async thunks
export const fetchWithdrawalSummary = createAsyncThunk(
  'wallet/fetchWithdrawalSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getWithdrawalSummary();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawal summary');
    }
  }
);

export const fetchAllWithdrawalRequests = createAsyncThunk(
  'wallet/fetchAllWithdrawalRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getAllWithdrawalRequests(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawal requests');
    }
  }
);

export const updateWithdrawalStatus = createAsyncThunk(
  'wallet/updateWithdrawalStatus',
  async ({ id, status, transactionId, notes }, { rejectWithValue }) => {
    try {
      const response = await walletAPI.updateWithdrawalStatus(id, {
        status,
        transactionId,
        notes
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update withdrawal status');
    }
  }
);

export const fetchSellerEarningsSummary = createAsyncThunk(
  'wallet/fetchSellerEarningsSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getSellerEarningsSummary();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller earnings');
    }
  }
);

export const createWithdrawalRequest = createAsyncThunk(
  'wallet/createWithdrawalRequest',
  async (data, { rejectWithValue }) => {
    try {
      const response = await walletAPI.createWithdrawalRequest(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create withdrawal request');
    }
  }
);

export const checkPayoutStatus = createAsyncThunk(
  'wallet/checkPayoutStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await walletAPI.checkPayoutStatus(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check payout status');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    // Withdrawal summary data
    summary: {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      processedRequests: 0,
      rejectedRequests: 0,
      totalWithdrawalAmount: 0,
      pendingAmount: 0,
      processedAmount: 0
    },
    
    // Withdrawal requests list
    withdrawals: [],
    withdrawalsPagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    },
    
    // Seller earnings data
    sellerEarnings: {
      totalSellers: 0,
      totalEarnings: 0,
      totalWithdrawals: 0,
      totalBalance: 0,
      sellers: []
    },
    
    // Loading states
    loading: false,
    summaryLoading: false,
    withdrawalsLoading: false,
    earningsLoading: false,
    
    // Error states
    error: null,
    summaryError: null,
    withdrawalsError: null,
    earningsError: null
  },
  reducers: {
    clearWalletErrors: (state) => {
      state.error = null;
      state.summaryError = null;
      state.withdrawalsError = null;
      state.earningsError = null;
    },
    
    clearWalletData: (state) => {
      state.summary = {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        processedRequests: 0,
        rejectedRequests: 0,
        totalWithdrawalAmount: 0,
        pendingAmount: 0,
        processedAmount: 0
      };
      state.withdrawals = [];
      state.sellerEarnings = {
        totalSellers: 0,
        totalEarnings: 0,
        totalWithdrawals: 0,
        totalBalance: 0,
        sellers: []
      };
    }
  },
  extraReducers: (builder) => {
    // Fetch withdrawal summary
    builder
      .addCase(fetchWithdrawalSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchWithdrawalSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchWithdrawalSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload;
      });

    // Fetch all withdrawal requests
    builder
      .addCase(fetchAllWithdrawalRequests.pending, (state) => {
        state.withdrawalsLoading = true;
        state.withdrawalsError = null;
      })
      .addCase(fetchAllWithdrawalRequests.fulfilled, (state, action) => {
        state.withdrawalsLoading = false;
        state.withdrawals = action.payload.data;
        state.withdrawalsPagination = action.payload.pagination;
      })
      .addCase(fetchAllWithdrawalRequests.rejected, (state, action) => {
        state.withdrawalsLoading = false;
        state.withdrawalsError = action.payload;
      });

    // Update withdrawal status
    builder
      .addCase(updateWithdrawalStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWithdrawalStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the withdrawal in the list
        const index = state.withdrawals.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.withdrawals[index] = action.payload;
        }
      })
      .addCase(updateWithdrawalStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch seller earnings summary
    builder
      .addCase(fetchSellerEarningsSummary.pending, (state) => {
        state.earningsLoading = true;
        state.earningsError = null;
      })
      .addCase(fetchSellerEarningsSummary.fulfilled, (state, action) => {
        state.earningsLoading = false;
        state.sellerEarnings = action.payload;
      })
      .addCase(fetchSellerEarningsSummary.rejected, (state, action) => {
        state.earningsLoading = false;
        state.earningsError = action.payload;
      });

    // Create withdrawal request
    builder
      .addCase(createWithdrawalRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWithdrawalRequest.fulfilled, (state) => {
        state.loading = false;
        // Optionally add the new request to the list
      })
      .addCase(createWithdrawalRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearWalletErrors, clearWalletData } = walletSlice.actions;
export default walletSlice.reducer;
