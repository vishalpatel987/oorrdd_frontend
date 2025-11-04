import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderAPI from '../../api/orderAPI';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getCart();
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async (payload, { rejectWithValue }) => {
    try {
      // Handle both old format (product, quantity) and new format (product, quantity, selectedVariants)
      const cartPayload = {
        product: payload.product,
        quantity: payload.quantity,
        selectedVariants: payload.selectedVariants || {}
      };
      const response = await orderAPI.addToCart(cartPayload);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.removeFromCart(productId);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const updateCartQuantityAsync = createAsyncThunk(
  'cart/updateCartQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateCartQuantity(productId, quantity);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart quantity');
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  updating: false, // Separate state for quantity updates to avoid showing full page spinner
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
    loadCart: (state, action) => {
      const data = action.payload;
      if (
        !data ||
        typeof data !== 'object' ||
        !Array.isArray(data.items) ||
        typeof data.total !== 'number' ||
        typeof data.itemCount !== 'number'
      ) {
        // Invalid structure, reset to empty
        state.items = [];
        state.total = 0;
        state.itemCount = 0;
        return;
      }
      state.items = data.items;
      state.total = data.total;
      state.itemCount = data.itemCount;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out invalid/empty items
        state.items = (action.payload || []).filter(item => item && item.product && item.quantity > 0);
        state.itemCount = state.items.reduce((total, item) => total + (item?.quantity ?? 0), 0);
        state.total = state.items.reduce((total, item) => total + ((item?.product?.price ?? 0) * (item?.quantity ?? 0)), 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = (action.payload || []).filter(item => item && item.product && item.quantity > 0);
        state.itemCount = state.items.reduce((total, item) => total + (item?.quantity ?? 0), 0);
        state.total = state.items.reduce((total, item) => total + ((item?.product?.price ?? 0) * (item?.quantity ?? 0)), 0);
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = (action.payload || []).filter(item => item && item.product && item.quantity > 0);
        state.itemCount = state.items.reduce((total, item) => total + (item?.quantity ?? 0), 0);
        state.total = state.items.reduce((total, item) => total + ((item?.product?.price ?? 0) * (item?.quantity ?? 0)), 0);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
            .addCase(updateCartQuantityAsync.pending, (state, action) => {
        state.updating = true;
        state.error = null;
        // Optimistic update - update quantity immediately for instant UI feedback
        const { productId, quantity } = action.meta.arg;
        const itemIndex = state.items.findIndex(item => item.product?._id === productId || item.product?.toString() === productId);
        if (itemIndex !== -1) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            state.items = state.items.filter(item => (item.product?._id !== productId && item.product?.toString() !== productId));
          } else {
            // Update quantity
            state.items[itemIndex].quantity = quantity;
          }
          // Recalculate totals immediately
          state.itemCount = state.items.reduce((total, item) => total + (item?.quantity ?? 0), 0);
          state.total = state.items.reduce((total, item) => total + ((item?.product?.price ?? 0) * (item?.quantity ?? 0)), 0);
        }
      })
      .addCase(updateCartQuantityAsync.fulfilled, (state, action) => {
        state.updating = false;
        // Sync with server response to ensure consistency
        state.items = (action.payload || []).filter(item => item && item.product && item.quantity > 0);                                                         
        state.itemCount = state.items.reduce((total, item) => total + (item?.quantity ?? 0), 0);                                                                
        state.total = state.items.reduce((total, item) => total + ((item?.product?.price ?? 0) * (item?.quantity ?? 0)), 0);                                    
      })
      .addCase(updateCartQuantityAsync.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        // Revert optimistic update on error by refetching cart
        // The component should handle this by calling fetchCart if needed
      });
  },
});

export const { clearCart, loadCart } = cartSlice.actions;
export default cartSlice.reducer; 