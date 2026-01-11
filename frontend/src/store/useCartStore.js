import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/cart');
          set({ cartItems: response.data.cart_items || [], isLoading: false });
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to fetch cart', isLoading: false });
        }
      },

      addToCart: async (productId, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/cart', {
            product_id: productId,
            quantity: quantity,
          });
          
          // Refresh cart
          await get().fetchCart();
          
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to add to cart', isLoading: false });
          throw error;
        }
      },

      updateCartItem: async (cartId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          await api.put(`/cart/${cartId}`, { quantity });
          await get().fetchCart();
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to update cart', isLoading: false });
          throw error;
        }
      },

      removeFromCart: async (cartId) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/cart/${cartId}`);
          await get().fetchCart();
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to remove from cart', isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.delete('/cart');
          set({ cartItems: [], isLoading: false });
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to clear cart', isLoading: false });
        }
      },

      getCartTotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => {
          return total + (item.product?.price || 0) * item.quantity;
        }, 0);
      },

      getCartCount: () => {
        const { cartItems } = get();
        return cartItems.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
