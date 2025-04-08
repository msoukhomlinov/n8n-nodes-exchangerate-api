import type { IExecuteFunctions } from 'n8n-workflow';
import type {
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError, NodeConnectionType } from 'n8n-workflow';
import type { OptionsWithUri } from 'request-promise-native';
import type { IRequestOptions } from 'n8n-workflow';
import * as currencyCodes from 'currency-codes';

// Generate currency options for dropdown
const getCurrencyOptions = () => {
  const codes = currencyCodes.codes();
  return codes.map((code) => {
    const details = currencyCodes.code(code);
    // Handle possible undefined details
    if (!details) {
      return {
        name: code,
        value: code,
        description: 'Currency code',
      };
    }
    return {
      name: `${code} - ${details.currency}`,
      value: code,
      description: `${details.currency} (${details.countries.join(', ')})`,
    };
  });
};

// Currency options for dropdowns
const currencyOptions = getCurrencyOptions();

export class ExchangeRateAPI implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ExchangeRate API',
    name: 'exchangeRateAPI',
    icon: 'file:exchangerate.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Consume ExchangeRate API',
    defaults: {
      name: 'ExchangeRate API',
    },
    inputs: [{ type: NodeConnectionType.Main }],
    outputs: [{ type: NodeConnectionType.Main }],
    credentials: [
      {
        name: 'exchangeRateCredentialsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Exchange Rate',
            value: 'exchangeRate',
          },
        ],
        default: 'exchangeRate',
        required: true,
        description: 'Resource to consume',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Get Exchange Rates',
            value: 'getExchangeRates',
            description: 'Get latest exchange rates from a base currency',
            action: 'Get latest exchange rates',
          },
          {
            name: 'Convert Value',
            value: 'convertValue',
            description: 'Convert a value from one currency to another',
            action: 'Convert a value from one currency to another',
          },
        ],
        default: 'getExchangeRates',
      },
      // Get Exchange Rates operation
      {
        displayName: 'Base Currency',
        name: 'baseCurrency',
        type: 'options',
        options: currencyOptions,
        default: 'USD',
        required: true,
        displayOptions: {
          show: {
            operation: ['getExchangeRates'],
          },
        },
        description: 'The three-letter currency code to get exchange rates for',
      },
      // Convert Value operation
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'number',
        default: 1,
        required: true,
        displayOptions: {
          show: {
            operation: ['convertValue'],
          },
        },
        description: 'The amount to convert',
      },
      {
        displayName: 'From Currency',
        name: 'fromCurrency',
        type: 'options',
        options: currencyOptions,
        default: 'USD',
        required: true,
        displayOptions: {
          show: {
            operation: ['convertValue'],
          },
        },
        description: 'The three-letter currency code to convert from',
      },
      {
        displayName: 'To Currency',
        name: 'toCurrency',
        type: 'options',
        options: currencyOptions,
        default: 'EUR',
        required: true,
        displayOptions: {
          show: {
            operation: ['convertValue'],
          },
        },
        description: 'The three-letter currency code to convert to',
      },
      {
        displayName: 'Use Conversion Fee',
        name: 'useConversionFee',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: ['convertValue'],
          },
        },
        description: 'Whether to apply a percentage fee to the conversion',
      },
      {
        displayName: 'Conversion Fee (%)',
        name: 'conversionFee',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            operation: ['convertValue'],
            useConversionFee: [true],
          },
        },
        description: 'Percentage fee to add to the conversion',
      },
      {
        displayName: 'Use Decimal Places',
        name: 'useDecimalPlaces',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: ['convertValue'],
          },
        },
        description: 'Whether to round the result to specific decimal places',
      },
      {
        displayName: 'Decimal Places',
        name: 'decimalPlaces',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            operation: ['convertValue'],
            useDecimalPlaces: [true],
          },
        },
        description: 'Number of decimal places to round the result to',
      },
      {
        displayName: 'Return Detailed Response',
        name: 'detailedResponse',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            operation: ['convertValue'],
          },
        },
        description: 'Whether to return a detailed response or just the converted amount',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];
    let responseData: IDataObject = {};

    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('exchangeRateCredentialsApi');
    const apiKey = credentials.apiKey as string;

    // Check that API key is not empty
    if (!apiKey || apiKey.trim() === '') {
      throw new NodeOperationError(
        this.getNode(),
        'API key is empty. Please provide a valid API key in the credentials.',
      );
    }

    for (let i = 0; i < items.length; i++) {
      try {
        if (operation === 'getExchangeRates') {
          const baseCurrency = this.getNodeParameter('baseCurrency', i) as string;
          const baseUrl = 'https://v6.exchangerate-api.com/v6';

          // Construct the URL with bearer authentication
          const url = `${baseUrl}/latest/${baseCurrency}`;
          const headers = {
            Authorization: `Bearer ${apiKey}`,
          };

          const options: OptionsWithUri = {
            method: 'GET',
            uri: url,
            headers: headers,
            json: true,
          };

          responseData = await this.helpers.request(options as unknown as IRequestOptions);

          // Validate the API response for getExchangeRates
          if (responseData.result === 'success') {
            // Validate that the rates object exists and has the expected structure
            if (
              !responseData.conversion_rates ||
              typeof responseData.conversion_rates !== 'object'
            ) {
              throw new NodeOperationError(
                this.getNode(),
                'Invalid API response: conversion_rates data is missing or has an unexpected format',
              );
            }
          } else {
            // Handle error response
            throw new NodeOperationError(
              this.getNode(),
              `API Error: ${responseData.error_type || 'Unknown error'} - ${responseData.error_message || 'No error message provided'}`,
              { itemIndex: i },
            );
          }
        } else if (operation === 'convertValue') {
          const amount = this.getNodeParameter('amount', i) as number;

          // Ensure amount is positive
          if (amount <= 0) {
            throw new NodeOperationError(this.getNode(), 'Amount must be a positive number');
          }

          const fromCurrency = this.getNodeParameter('fromCurrency', i) as string;
          const toCurrency = this.getNodeParameter('toCurrency', i) as string;

          const useConversionFee = this.getNodeParameter('useConversionFee', i) as boolean;
          const useDecimalPlaces = this.getNodeParameter('useDecimalPlaces', i) as boolean;

          // Default to 0 for conversion fee if not using it
          let conversionFee = 0;
          if (useConversionFee) {
            conversionFee = this.getNodeParameter('conversionFee', i) as number;
          }

          // Default to not rounding if not using decimal places
          let decimalPlaces: number | undefined;
          if (useDecimalPlaces) {
            decimalPlaces = this.getNodeParameter('decimalPlaces', i) as number;

            // Ensure decimalPlaces is a non-negative integer
            if (decimalPlaces < 0 || !Number.isInteger(decimalPlaces)) {
              throw new NodeOperationError(
                this.getNode(),
                'Decimal places must be a non-negative integer',
              );
            }
          }

          const baseUrl = 'https://v6.exchangerate-api.com/v6';

          // Construct the URL with bearer authentication
          const url = `${baseUrl}/latest/${fromCurrency}`;
          const headers = {
            Authorization: `Bearer ${apiKey}`,
          };

          const options2: OptionsWithUri = {
            method: 'GET',
            uri: url,
            headers: headers,
            json: true,
          };

          responseData = await this.helpers.request(options2 as unknown as IRequestOptions);

          if (responseData.result === 'success') {
            // Validate that the rates object exists and has the expected structure
            if (
              !responseData.conversion_rates ||
              typeof responseData.conversion_rates !== 'object'
            ) {
              throw new NodeOperationError(
                this.getNode(),
                'Invalid API response: conversion_rates data is missing or has an unexpected format',
              );
            }

            const rates = responseData.conversion_rates as { [key: string]: number };

            // Check if the target currency exists in the rates
            if (!rates[toCurrency]) {
              throw new NodeOperationError(
                this.getNode(),
                `Currency ${toCurrency} not found in exchange rates`,
              );
            }

            const exchangeRate = rates[toCurrency];
            const convertedValue = amount * exchangeRate;

            // Apply conversion fee if enabled
            let valueWithFee = convertedValue;
            if (useConversionFee) {
              valueWithFee = convertedValue * (1 + conversionFee / 100);
            }

            // Round to specified decimal places if enabled
            let roundedValue = valueWithFee;
            if (useDecimalPlaces && decimalPlaces !== undefined) {
              roundedValue = Number(valueWithFee.toFixed(decimalPlaces));
            }

            const detailedResponse = this.getNodeParameter('detailedResponse', i) as boolean;

            if (detailedResponse) {
              // Return detailed response
              responseData = {
                result: 'success',
                from: fromCurrency,
                to: toCurrency,
                amount: amount,
                exchange_rate: exchangeRate,
                conversion_fee_percentage: useConversionFee ? conversionFee : 0,
                converted_amount: roundedValue,
                time_last_update_utc: responseData.time_last_update_utc,
              };
            } else {
              // Return only the converted amount
              responseData = {
                converted_amount: roundedValue,
              };
            }
          } else {
            // Handle error response
            throw new NodeOperationError(
              this.getNode(),
              `API Error: ${responseData.error_type || 'Unknown error'} - ${responseData.error_message || 'No error message provided'}`,
              { itemIndex: i },
            );
          }
        }

        returnData.push(responseData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ error: error.message });
          continue;
        }
        throw error;
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
