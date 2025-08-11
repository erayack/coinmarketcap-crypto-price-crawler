import { environment, LaunchType, updateCommandMetadata, showToast, Toast } from "@raycast/api";
import { getCoinPriceForSubtitle, getSelectedCoinForSubtitle } from "./utils/useSubtitleCrypto";
import { formatPriceSubtitle } from "./utils/priceFormatter";

export default async function Command() {
  try {
    // Get the selected cryptocurrency for subtitle display
    const selectedCoin = await getSelectedCoinForSubtitle();

    if (!selectedCoin) {
      // No coin selected, set default subtitle
      await updateCommandMetadata({ subtitle: "No crypto selected" });

      // Only show toast on manual refresh (not on scheduled runs)
      if (environment.launchType === LaunchType.UserInitiated) {
        await showToast({
          style: Toast.Style.Failure,
          title: "No cryptocurrency selected",
          message: "Use Search or Watchlist to select a crypto for price tracking",
        });
      }
      return;
    }

    // Fetch the current price for the selected cryptocurrency
    const priceData = await getCoinPriceForSubtitle(selectedCoin);

    if (!priceData) {
      await updateCommandMetadata({ subtitle: `${selectedCoin.name}: Price unavailable` });

      if (environment.launchType === LaunchType.UserInitiated) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch price",
          message: `Could not get price for ${selectedCoin.name}`,
        });
      }
      return;
    }

    // Format the price data into a subtitle
    const subtitle = formatPriceSubtitle(selectedCoin, priceData);

    // Update the command subtitle
    await updateCommandMetadata({ subtitle });

    // Show success toast only on manual refresh
    if (environment.launchType === LaunchType.UserInitiated) {
      await showToast({
        style: Toast.Style.Success,
        title: "Price updated",
        message: `${selectedCoin.name}: ${priceData.price}`,
      });
    }
  } catch (error) {
    console.error("Error in price-tracker command:", error);

    await updateCommandMetadata({ subtitle: "Error fetching price" });

    if (environment.launchType === LaunchType.UserInitiated) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
}
