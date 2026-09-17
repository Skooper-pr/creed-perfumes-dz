'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { trackAddToCart } from '@/lib/tracking';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'creed_perfumes_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load cart from storage', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        if (items.length > 0) {
          localStorage.setItem('creed_cart_last_interaction', String(Date.now()));
        }
      } catch (err) {
        console.error('Failed to save cart to storage', err);
      }
    }
  }, [items, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  const hideToast = () => setToastMessage(null);

  const addItem = (product: Product, quantity = 1) => {
    const maxStock = Math.max(0, product.stock ?? 10);
    if (maxStock <= 0) {
      showToast(`عذراً، نفذت كمية "${product.name}" من المخزون حالياً.`);
      return;
    }

    setItems(prevItems => {
      const existing = prevItems.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + quantity);
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [...prevItems, { product, quantity: Math.min(maxStock, quantity) }];
    });

    const activePrice = product.discount_price ?? product.price;
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: activePrice,
      qty: quantity,
    });
    showToast(`تمت إضافة "${product.name}" إلى سلة المشتريات (${activePrice.toLocaleString('ar-DZ')} دج)`);
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const maxStock = Math.max(1, item.product.stock ?? 10);
          const clamped = Math.min(maxStock, quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discount_price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        toastMessage,
        showToast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
