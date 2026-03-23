import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface CartItem {
	productId: string;
	productName: string;
	productImage: string;
	productPrice: number;
	qty: number;
}

interface CartContextType {
	items: CartItem[];
	totalItems: number;
	totalPrice: number;
	addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
	removeItem: (productId: string) => void;
	updateQty: (productId: string, qty: number) => void;
	clearCart: () => void;
}

const CART_KEY = 'athlex_cart';

const CartContext = createContext<CartContextType>({
	items: [],
	totalItems: 0,
	totalPrice: 0,
	addItem: () => {},
	removeItem: () => {},
	updateQty: () => {},
	clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);

	// Hydrate from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(CART_KEY);
			if (stored) setItems(JSON.parse(stored));
		} catch {}
	}, []);

	// Persist to localStorage on change
	useEffect(() => {
		localStorage.setItem(CART_KEY, JSON.stringify(items));
	}, [items]);

	const addItem = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
		setItems((prev) => {
			const existing = prev.find((i) => i.productId === item.productId);
			if (existing) {
				return prev.map((i) =>
					i.productId === item.productId ? { ...i, qty: i.qty + qty } : i,
				);
			}
			return [...prev, { ...item, qty }];
		});
	}, []);

	const removeItem = useCallback((productId: string) => {
		setItems((prev) => prev.filter((i) => i.productId !== productId));
	}, []);

	const updateQty = useCallback((productId: string, qty: number) => {
		if (qty <= 0) {
			setItems((prev) => prev.filter((i) => i.productId !== productId));
		} else {
			setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)));
		}
	}, []);

	const clearCart = useCallback(() => setItems([]), []);

	const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
	const totalPrice = items.reduce((sum, i) => sum + i.productPrice * i.qty, 0);

	return (
		<CartContext.Provider value={{ items, totalItems, totalPrice, addItem, removeItem, updateQty, clearCart }}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	return useContext(CartContext);
}
