# n8n-nodes-exchangerate-api

This is an n8n community node for the [ExchangeRate API](https://www.exchangerate-api.com). It provides a simple way to get currency exchange rates and perform conversions within your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Resources](#resources)  

## Usage Preview

![ExchangeRate API Node Usage Preview](usage-preview.gif)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Using n8n Desktop and GUI

1. Go to **Settings > Community Nodes**
2. Enter `n8n-nodes-exchangerate-api` in the "Enter npm package name" field
3. Click "Install"
4. After installation, you'll find the "ExchangeRate API" node in the node library

### Using npm

```bash
npm install n8n-nodes-exchangerate-api
```

## Operations

This node supports the following operations:

### Get Exchange Rates

Fetches the latest exchange rates from a base currency (e.g., USD) to all other supported currencies.

**Parameters:**
- **Resource**: Exchange Rate (default)
- **Base Currency**: Select a currency from the dropdown of ISO 4217 currency codes (e.g., USD, EUR, GBP)

### Convert Value

Converts a value from one currency to another.

**Parameters:**
- **Resource**: Exchange Rate (default)
- **Amount**: The amount to convert (must be positive)
- **From Currency**: Select a currency from the dropdown of ISO 4217 currency codes
- **To Currency**: Select a currency from the dropdown of ISO 4217 currency codes
- **Use Conversion Fee**: Toggle to enable/disable applying a percentage fee
  - **Conversion Fee (%)**: Percentage fee to add to the conversion (only shown when toggle is enabled)
- **Use Decimal Places**: Toggle to enable/disable rounding to specific decimal places
  - **Decimal Places**: Number of decimal places to round the result to (only shown when toggle is enabled, must be a non-negative integer)
- **Return Detailed Response**: Toggle to switch between detailed or simple response format
  - When enabled (default): Returns full conversion details including rates, fee, and timestamps
  - When disabled: Returns only the converted amount value

## Credentials

This node requires an API key from ExchangeRate API. You can get a free API key by [signing up](https://www.exchangerate-api.com/).

The node uses Token Bearer Authentication (Authorization header with Bearer token).

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [ExchangeRate API documentation](https://www.exchangerate-api.com/docs/overview)

## License

[MIT](LICENSE.md) 

---
Last updated: April 2025
