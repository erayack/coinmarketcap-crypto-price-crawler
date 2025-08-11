import { useState, useEffect } from "react";
import { List, showToast, Toast } from "@raycast/api";
import useCoinWatchList from "./utils/useCoinWatchList";
import CoinListItem from "./components/CoinListItem";
import useCoinPriceStore from "./utils/useCoinPriceStore";
import { CryptoCurrency } from "./types";
import { useFrecencySorting } from "@raycast/utils";
import { setSelectedCoinForSubtitle } from "./utils/useSubtitleCrypto";
import { addToMenuBar } from "./utils/useMenuBarCrypto";

export default function WatchList() {
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  const { store: coinPriceStore, refresh: refreshCoinPrice, batchFetchPrice } = useCoinPriceStore(selectedSlug);
  const { watchList, addToWatchList, removeFromWatchList, loading: watchListLoading } = useCoinWatchList();

  const { data: sortedWatchList, visitItem } = useFrecencySorting<CryptoCurrency>(watchList, {
    key: (item: CryptoCurrency) => {
      return item.slug;
    },
  });

  useEffect(() => {
    batchFetchPrice(sortedWatchList.map(({ slug }: CryptoCurrency) => slug));
  }, [sortedWatchList]);

  const onSelectChange = (id?: string | null) => {
    if (!id) return;

    const [slug, symbol, name] = id.split("_");

    setSelectedSlug(slug);
    visitItem({ slug, symbol, name });
  };

  const handleSetSubtitleCoin = async (coin: CryptoCurrency) => {
    try {
      await setSelectedCoinForSubtitle(coin);
      await showToast({
        style: Toast.Style.Success,
        title: "Subtitle Tracker Set",
        message: `${coin.name} will now appear in Price Tracker subtitle`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to set subtitle tracker",
      });
    }
  };

  const handleAddToMenuBar = async (coin: CryptoCurrency) => {
    try {
      await addToMenuBar(coin);
      await showToast({
        style: Toast.Style.Success,
        title: "Added to Menu Bar",
        message: `${coin.name} will now appear in menu bar dropdown`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to add to menu bar",
      });
    }
  };

  return (
    <List
      isLoading={watchListLoading}
      throttle
      searchBarPlaceholder="Enter the crypto name"
      onSelectionChange={onSelectChange}
    >
      {!watchListLoading && sortedWatchList.length > 0 && (
        <List.Section title="Coins in Watchlist">
          {sortedWatchList.map(({ name, symbol, slug }: CryptoCurrency) => (
            <CoinListItem
              key={`WATCH_${name}`}
              name={name}
              slug={slug}
              symbol={symbol}
              coinPriceStore={coinPriceStore}
              addToWatchList={addToWatchList}
              removeFromWatchList={removeFromWatchList}
              isWatchList
              refreshCoinPrice={refreshCoinPrice}
              onSetSubtitleCoin={handleSetSubtitleCoin}
              onAddToMenuBar={handleAddToMenuBar}
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
