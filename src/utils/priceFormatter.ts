import { SelectedCoinForSubtitle, CoinPriceData } from "./useSubtitleCrypto";
import { PriceDirection } from "../types";

/**
 * Format price data into a concise subtitle string
 */
export function formatPriceSubtitle(coin: SelectedCoinForSubtitle, priceData: CoinPriceData): string {
  const { symbol } = coin;
  const uppercaseSymbol = symbol.toUpperCase();
  const { price, changePercent24h, direction } = priceData;

  // Format the price (remove excessive decimal places for readability)
  const formattedPrice = formatPrice(price);

  // Handle the case where changePercent24h might be empty or invalid
  if (!changePercent24h || changePercent24h === "0" || changePercent24h === "0%") {
    return `${uppercaseSymbol} ${formattedPrice}`;
  }

  // Use the direction information from the API (like the extension does)
  let directionSymbol = "";
  let trendIndicator = "";
  
  if (direction) {
    // Match the extension's approach: + for UP, - for DOWN
    directionSymbol = direction === PriceDirection.UP ? "+" : "-";
    // Use simple arrow indicators instead of emojis
    trendIndicator = direction === PriceDirection.UP ? "↗" : "↘";
  } else {
    // Fallback to parsing the change if no direction provided
    const cleanChange = changePercent24h.replace(/[%$,]/g, "");
    const percentChange = parseFloat(cleanChange);
    if (!isNaN(percentChange)) {
      directionSymbol = percentChange >= 0 ? "+" : "-";
      trendIndicator = percentChange >= 0 ? "↗" : "↘";
    }
  }

  // Format like the extension: "BTC $42,500 📈 +2.5%"
  const formattedChange = changePercent24h.includes("%") ? changePercent24h : `${changePercent24h}%`;
  
  // Ensure we have a proper + or - prefix
  const prefixedChange = formattedChange.startsWith('+') || formattedChange.startsWith('-') 
    ? formattedChange 
    : `${directionSymbol}${formattedChange}`;

  return `${uppercaseSymbol} ${formattedPrice} ${trendIndicator} ${prefixedChange}`;
}

/**
 * Format price to be more readable in subtitle
 */
export function formatPrice(priceString: string): string {
  try {
    // Remove $ and commas, parse as float
    const cleanPrice = priceString.replace(/[$,]/g, "");
    const price = parseFloat(cleanPrice);

    if (isNaN(price)) return priceString;

    // For prices over $1000, show no decimals
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }

    // For prices over $1, show 2 decimals
    if (price >= 1) {
      return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    }

    // For prices under $1, show up to 4 significant digits
    if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    }

    // For very small prices, use scientific notation or show more decimals
    if (price > 0) {
      return `$${price.toFixed(6)}`;
    }

    return priceString; // Fallback to original string
  } catch (error) {
    console.error("Error formatting price:", error);
    return priceString;
  }
}

/**
 * Create a visual price trend indicator using characters
 */
export function createPriceTrendBar(changePercent: number): string {
  const absChange = Math.abs(changePercent);

  // Create a simple bar based on percentage change magnitude
  if (absChange >= 10) return "████";
  if (absChange >= 5) return "███□";
  if (absChange >= 2) return "██□□";
  if (absChange >= 1) return "█□□□";
  return "□□□□";
}
