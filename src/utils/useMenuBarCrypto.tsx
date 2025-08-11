import { LocalStorage } from "@raycast/api";
import { CryptoCurrency } from "../types";

const MENUBAR_CRYPTOS_KEY = "MENUBAR_CRYPTOS";
const MENUBAR_CURRENT_KEY = "MENUBAR_CURRENT_CRYPTO";

export interface MenuBarCrypto extends CryptoCurrency {
  shown: boolean; // Whether to show in menu bar dropdown
}

export interface MenuBarState {
  cryptos: MenuBarCrypto[];
  currentTitle: string; // The crypto currently shown in menu bar title
}

/**
 * Get all menu bar cryptos and current title
 */
export async function getMenuBarState(): Promise<MenuBarState> {
  try {
    const [cryptosStored, currentStored] = await Promise.all([
      LocalStorage.getItem(MENUBAR_CRYPTOS_KEY),
      LocalStorage.getItem(MENUBAR_CURRENT_KEY),
    ]);

    const cryptos: MenuBarCrypto[] = cryptosStored ? JSON.parse(cryptosStored as string) : [];
    const currentTitle: string = (currentStored as string) || "";

    return { cryptos, currentTitle };
  } catch (error) {
    console.error("Error getting menu bar state:", error);
    return { cryptos: [], currentTitle: "" };
  }
}

/**
 * Add a crypto to menu bar (set shown = true)
 */
export async function addToMenuBar(coin: CryptoCurrency): Promise<void> {
  try {
    const state = await getMenuBarState();
    
    // Check if crypto already exists
    const existingIndex = state.cryptos.findIndex(c => c.slug === coin.slug);
    
    if (existingIndex >= 0) {
      // Update existing crypto to show in menu bar
      state.cryptos[existingIndex].shown = true;
    } else {
      // Add new crypto to menu bar
      state.cryptos.push({
        ...coin,
        shown: true,
      });
    }

    await LocalStorage.setItem(MENUBAR_CRYPTOS_KEY, JSON.stringify(state.cryptos));
    
    // If no current title is set, set this as the current title
    if (!state.currentTitle) {
      await setCurrentMenuBarTitle(coin.symbol.toUpperCase());
    }
  } catch (error) {
    console.error("Error adding to menu bar:", error);
    throw error;
  }
}

/**
 * Remove a crypto from menu bar (set shown = false)
 */
export async function removeFromMenuBar(slug: string): Promise<void> {
  try {
    const state = await getMenuBarState();
    const cryptoIndex = state.cryptos.findIndex(c => c.slug === slug);
    
    if (cryptoIndex >= 0) {
      state.cryptos[cryptoIndex].shown = false;
    }

    await LocalStorage.setItem(MENUBAR_CRYPTOS_KEY, JSON.stringify(state.cryptos));
    
    // If this was the current title, find another one or clear it
    const currentCrypto = state.cryptos.find(c => c.symbol.toUpperCase() === state.currentTitle);
    if (currentCrypto && currentCrypto.slug === slug) {
      const nextCrypto = state.cryptos.find(c => c.shown && c.slug !== slug);
      if (nextCrypto) {
        await setCurrentMenuBarTitle(nextCrypto.symbol.toUpperCase());
      } else {
        await setCurrentMenuBarTitle("");
      }
    }
  } catch (error) {
    console.error("Error removing from menu bar:", error);
    throw error;
  }
}

/**
 * Set the current menu bar title (which crypto to show in the menu bar)
 */
export async function setCurrentMenuBarTitle(symbol: string): Promise<void> {
  try {
    await LocalStorage.setItem(MENUBAR_CURRENT_KEY, symbol.toUpperCase());
  } catch (error) {
    console.error("Error setting current menu bar title:", error);
    throw error;
  }
}

/**
 * Get cryptos that should be shown in menu bar dropdown
 */
export async function getMenuBarCryptos(): Promise<MenuBarCrypto[]> {
  try {
    const state = await getMenuBarState();
    return state.cryptos.filter(c => c.shown);
  } catch (error) {
    console.error("Error getting menu bar cryptos:", error);
    return [];
  }
}

/**
 * Get the crypto that should be shown in menu bar title
 */
export async function getCurrentMenuBarCrypto(): Promise<MenuBarCrypto | null> {
  try {
    const state = await getMenuBarState();
    if (!state.currentTitle) return null;
    
    return state.cryptos.find(c => 
      c.symbol.toUpperCase() === state.currentTitle && c.shown
    ) || null;
  } catch (error) {
    console.error("Error getting current menu bar crypto:", error);
    return null;
  }
}