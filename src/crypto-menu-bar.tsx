import { useState, useEffect } from "react";
import { MenuBarExtra, getPreferenceValues, Icon } from "@raycast/api";
import { 
  getMenuBarState, 
  getCurrentMenuBarCrypto, 
  setCurrentMenuBarTitle, 
  MenuBarCrypto 
} from "./utils/useMenuBarCrypto";
import { getCoinPriceForSubtitle } from "./utils/useSubtitleCrypto";
import { formatPrice } from "./utils/priceFormatter";
import { PriceDirection } from "./types";

interface Preferences {
  enableMenuBar: boolean;
  menuBarRefreshInterval: string;
}

export default function CryptoMenuBar() {
  const preferences = getPreferenceValues<Preferences>();
  
  // If menu bar is disabled in preferences, return empty menu bar
  if (!preferences.enableMenuBar) {
    return <MenuBarExtra title="" tooltip="Menu Bar Disabled - Enable in Preferences" />;
  }

  const [menuBarCryptos, setMenuBarCryptos] = useState<MenuBarCrypto[]>([]);
  const [currentCrypto, setCurrentCrypto] = useState<MenuBarCrypto | null>(null);
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [currentChange, setCurrentChange] = useState<string>("");
  const [currentDirection, setCurrentDirection] = useState<PriceDirection | undefined>();
  const [loading, setLoading] = useState(true);

  // Load menu bar state and current crypto price
  useEffect(() => {
    loadMenuBarData();
  }, []);

  const loadMenuBarData = async () => {
    try {
      setLoading(true);
      
      // Get menu bar state
      const state = await getMenuBarState();
      const shownCryptos = state.cryptos.filter(c => c.shown);
      setMenuBarCryptos(shownCryptos);
      
      // Get current crypto
      const current = await getCurrentMenuBarCrypto();
      setCurrentCrypto(current);
      
      // If we have a current crypto, fetch its price
      if (current) {
        const priceData = await getCoinPriceForSubtitle(current);
        if (priceData) {
          setCurrentPrice(priceData.price);
          setCurrentChange(priceData.changePercent24h);
          setCurrentDirection(priceData.direction);
        }
      }
    } catch (error) {
      console.error("Error loading menu bar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSelect = async (crypto: MenuBarCrypto) => {
    try {
      await setCurrentMenuBarTitle(crypto.symbol);
      setCurrentCrypto(crypto);
      
      // Fetch price for the selected crypto
      const priceData = await getCoinPriceForSubtitle(crypto);
      if (priceData) {
        setCurrentPrice(priceData.price);
        setCurrentChange(priceData.changePercent24h);
        setCurrentDirection(priceData.direction);
      }
    } catch (error) {
      console.error("Error selecting crypto:", error);
    }
  };

  // Format the title for the menu bar
  const getMenuBarTitle = () => {
    if (loading) return "Loading...";
    if (!currentCrypto) return "No Crypto";
    
    const symbol = currentCrypto.symbol.toUpperCase();
    const price = formatPrice(currentPrice);
    
    // Only show symbol and price, no percentage
    return `${symbol} ${price}`;
  };

  // Get the icon for the menu bar - always show direction arrows
  const getMenuBarIcon = () => {
    if (currentDirection === PriceDirection.UP) {
      return { source: Icon.ArrowUp, tintColor: "#00FF00" };
    } else if (currentDirection === PriceDirection.DOWN) {
      return { source: Icon.ArrowDown, tintColor: "#FF0000" };
    }
    
    return { source: Icon.Coins };
  };

  return (
    <MenuBarExtra 
      title={getMenuBarTitle()} 
      icon={getMenuBarIcon()}
      tooltip="Crypto Prices"
    >
      {menuBarCryptos.length === 0 ? (
        <>
          <MenuBarExtra.Item
            title="No cryptocurrencies added"
            subtitle="Add cryptos from Search or Watchlist"
            icon={Icon.Info}
          />
          <MenuBarExtra.Separator />
          <MenuBarExtra.Item
            title="How to add cryptos:"
            subtitle="Use Cmd+Shift+M in Search or Watchlist"
            icon={Icon.QuestionMark}
          />
        </>
      ) : (
        <>
          <MenuBarExtra.Section title="Select Crypto">
            {menuBarCryptos.map((crypto) => (
              <MenuBarExtra.Item
                key={crypto.slug}
                title={`${crypto.symbol.toUpperCase()} - ${crypto.name}`}
                subtitle={currentCrypto?.slug === crypto.slug ? "Current" : undefined}
                icon={currentCrypto?.slug === crypto.slug ? Icon.CheckCircle : Icon.Coins}
                onAction={() => handleCryptoSelect(crypto)}
              />
            ))}
          </MenuBarExtra.Section>
          
          <MenuBarExtra.Separator />
          
          {currentCrypto && (
            <MenuBarExtra.Section title="Current Price">
              <MenuBarExtra.Item
                title={`${currentCrypto.name} (${currentCrypto.symbol.toUpperCase()})`}
                subtitle={`${currentPrice} ${currentChange ? currentChange : ""}`}
                icon={currentDirection === PriceDirection.UP ? 
                  { source: Icon.ArrowUp, tintColor: "#00FF00" } : 
                  currentDirection === PriceDirection.DOWN ? 
                  { source: Icon.ArrowDown, tintColor: "#FF0000" } : 
                  Icon.Coins
                }
              />
            </MenuBarExtra.Section>
          )}
        </>
      )}
      
      <MenuBarExtra.Separator />
      
      <MenuBarExtra.Item
        title="Refresh Prices"
        icon={Icon.ArrowClockwise}
        onAction={loadMenuBarData}
        shortcut={{ modifiers: ["cmd"], key: "r" }}
      />
    </MenuBarExtra>
  );
}