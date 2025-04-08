module.exports = {
    credentials: {
        ExchangeRateCredentialsApi: {
            operations: [
                {
                    name: 'exchangeRateCredentialsApi',
                    type: 'credential',
                    displayName: 'ExchangeRate API',
                    required: true,
                },
            ],
        },
    },
    nodes: {
        ExchangeRateAPI: {
            operations: [
                {
                    name: 'exchangeRateAPI',
                    type: 'node',
                    displayName: 'ExchangeRate API',
                },
            ],
        },
    },
};
