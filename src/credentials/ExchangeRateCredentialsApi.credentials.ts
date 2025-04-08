import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ExchangeRateCredentialsApi implements ICredentialType {
  name = 'exchangeRateCredentialsApi';
  displayName = 'ExchangeRate API';
  documentationUrl = 'https://www.exchangerate-api.com/docs/authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'The API key for the ExchangeRate API',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{`Bearer ${$credentials.apiKey}`}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://v6.exchangerate-api.com',
      url: '/v6/latest/USD',
      method: 'GET',
    },
  };
}
