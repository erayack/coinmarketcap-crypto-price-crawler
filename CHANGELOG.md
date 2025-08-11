# CoinMarketCap Crypto Crawler Changelog

## [Improve Menu Bar UX with Preferences] - 2025-01-11

- **IMPROVED: Menu Bar Configuration** - Converted to preference-based system for better UX
  - Menu bar now controlled via Extension Preferences instead of standalone command
  - Added "Show in Menu Bar" checkbox in extension settings
  - Configurable refresh intervals (1m, 2m, 5m) through preferences
  - Toggle menu bar icon visibility via preferences
  - Cleaner command list - no separate menu bar command to manage
  - More discoverable through standard Raycast preference flow
- **Enhanced User Guidance** - Better onboarding and help
  - Clear instructions in menu bar dropdown when no cryptos added
  - Helpful tooltips and guidance for new users
  - Consistent with other Raycast extensions' UX patterns

## [Add Live Crypto Tracking Features] - 2025-01-11

- **NEW: Price Tracker Command** - Live crypto prices displayed directly in Raycast command subtitle
  - Updates every 5 minutes automatically
  - Select any crypto with `Cmd+Shift+T` to track in subtitle
  - Shows format: "BTC $42,500 ↗ +2.5%" with trend indicators
  - Manual refresh support for instant updates
- **NEW: Menu Bar Integration** - Display live crypto prices in system menu bar
  - Clean menu bar title showing only symbol and price (e.g., "BTC $42,500")  
  - Color-coded arrow icons indicating price direction (green up, red down)
  - Detailed dropdown with full price info and percentage changes
  - Auto-refresh every 2 minutes with manual refresh option (`Cmd+R`)
  - Add cryptos to menu bar with `Cmd+Shift+M` from Search or Watchlist
- **Enhanced Price Display** - Improved formatting and styling
  - Uppercase ticker symbols for consistency
  - Smart price formatting (removes excessive decimals)
  - Direction-aware trend indicators using API data
  - Consistent styling matching extension's existing green/red theme
- **Persistent Storage** - LocalStorage integration for user preferences
  - Remembers selected crypto for subtitle tracking
  - Manages menu bar crypto selections and current display
  - Seamless state management across commands

## [Update metadata] - 2025-01-19

- add README.md to let user easily understand the extension.
- add screenshots in `metadata` folder.

## [Improve User Experience] - 2025-01-19

- fix the crawler issue caused by page structure change.
- add a separated watchlist page to keep track of your favorite coins.
- remove the original `favorite` section in the search result.
- change the shortcut of add to watchlist to be `cmd + w`
- use bignumber.js to handle the price calculation in the currency converter.
- add colored tag with the price direction for each coin in the watchlist and search result.

## [Improve error handling ] - 2022-02-03

- Improve error handling flow to prevent crash when fetching data from CoinMarketCap.

## [Improve CoinMarketCap extensions ] - 2021-12-23

- Add favorite command and change output style for coinmarketcap extension
- Add currency converter for calculating value in USD & in selected crypto currency

## [Update cache mechanism] - 2021-11-10

- make sure that icon image format is png.
- change the day to update cached file to be 15 days because crypto market changes very fast.

## [First Release] - 2021-10-26

- initial release
