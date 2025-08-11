import { LocalStorage } from "@raycast/api";
import { CryptoCurrency, PriceDirection } from "../types";
import { fetchPrice } from "../api";

const SUBTITLE_CRYPTO_KEY = "SUBTITLE_CRYPTO";

export interface SelectedCoinForSubtitle {
  name: string;
  symbol: string;
  slug: string;
}

export interface CoinPriceData {
  price: string;
  change24h: string;
  changePercent24h: string;
  direction?: PriceDirection;
  marketCap?: string;
}

/**
 * Get the currently selected cryptocurrency for subtitle display
 */
export async function getSelectedCoinForSubtitle(): Promise<SelectedCoinForSubtitle | null> {
  try {
    const stored = await LocalStorage.getItem(SUBTITLE_CRYPTO_KEY);
    if (!stored) return null;

    return JSON.parse(stored as string) as SelectedCoinForSubtitle;
  } catch (error) {
    console.error("Error getting selected coin for subtitle:", error);
    return null;
  }
}

/**
 * Set the selected cryptocurrency for subtitle display
 */
export async function setSelectedCoinForSubtitle(coin: CryptoCurrency): Promise<void> {
  try {
    const selectedCoin: SelectedCoinForSubtitle = {
      name: coin.name,
      symbol: coin.symbol,
      slug: coin.slug,
    };

    await LocalStorage.setItem(SUBTITLE_CRYPTO_KEY, JSON.stringify(selectedCoin));
  } catch (error) {
    console.error("Error setting selected coin for subtitle:", error);
    throw error;
  }
}

/**
 * Clear the selected cryptocurrency for subtitle display
 */
export async function clearSelectedCoinForSubtitle(): Promise<void> {
  try {
    await LocalStorage.removeItem(SUBTITLE_CRYPTO_KEY);
  } catch (error) {
    console.error("Error clearing selected coin for subtitle:", error);
    throw error;
  }
}

/**
 * Fetch price data for the selected cryptocurrency using the API directly
 */
export async function getCoinPriceForSubtitle(selectedCoin: SelectedCoinForSubtitle): Promise<CoinPriceData | null> {
  try {
    // Use the API directly to fetch price data
    const priceInfo = await fetchPrice(selectedCoin.slug);

    if (!priceInfo) return null;

    return {
      price: priceInfo.currencyPrice || "$0",
      change24h: priceInfo.priceDiff || "0",
      changePercent24h: priceInfo.priceDiff || "0%", // priceDiff contains the percentage
      direction: priceInfo.direction, // Include direction for better styling
    };
  } catch (error) {
    console.error("Error fetching coin price for subtitle:", error);
    return null;
  }
}
