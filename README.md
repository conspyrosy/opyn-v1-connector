# opyn-v1-connector

opyn-v1-connector is a library for helping you interact with the opyn v1 smart contracts on the ethereum blockchain. This project is still in pre-release - it still needs a bit of a cleanup.

NOTE: This package doesnt work with metamask!!! For some reason metamask doesn't allow you to use BatchRequest functionality from web3. It works fine with your own node or an infura node (which is weird since metamask is using infura by default).

### Usage:

Firstly install the dependency to your project

```
npm i opyn-v1-connector --save
```

Import the dependency where you need it:

```
const OpynConnectorV1 = require('opyn-v1-connector');
```

Instantiate the fetcher and pass in a web3 instance:

```
const web3 = new Web3(new Web3.providers.HttpProvider(`https://localhost:8545`));

const opynConnector = new OpynConnector({ web3 });
```

### Fetching data:

Once you have your connector instantiated, you can initialise it using the init method. You can then access options contracts:

```
try {
    await opynConnector.init();
    console.log(opynConnector.optionsContracts);
} catch(err) {
    console.error("Error: " + err);
}
```

This will return a list of active options:

```
[
  {
    address: '0xde34d5e3f942b4543c309a0fb0461497e72c793c',
    name: 'Opyn aUSDC insurance',
    isExerciseWindow: true,
    totalSupply: '24604000000',
    decimals: '6',
    liquidationFactor: 0.5,
    optionsExchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    underlying: '0x9ba00d6856a4edf4665bca2c2309936572473b7e',
    COMPOUND_ORACLE: '0x7054e08461e3ecb7718b63540addb3c3a1746415',
    liquidationIncentive: 0.01,
    owner: '0x87887cf0e37d937f989ab76b99e4f4682da044c4',
    isOwner: false,
    hasExpired: false,
    symbol: 'oaUSDC',
    transactionFee: 0,
    strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    underlyingExp: '-6',
    collateralExp: '-18',
    oTokenExchangeRate: 0.000001,
    minCollateralizationRatio: 1.4000000000000001,
    strikePrice: 9.800000000000001e-7,
    collateral: '0x0000000000000000000000000000000000000000',
    expiry: '1625011200'
  },
  {
    address: '0xc6b11850241c5127eab73af4b6c68bc267cbbff4',
    name: 'Opyn WETH Put $360 12/25/20',
    isExerciseWindow: true,
    totalSupply: '5975312391',
    decimals: '7',
    liquidationFactor: 0,
    optionsExchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
    underlying: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    COMPOUND_ORACLE: '0x7054e08461e3ecb7718b63540addb3c3a1746415',
    liquidationIncentive: 0,
    owner: '0x87887cf0e37d937f989ab76b99e4f4682da044c4',
    isOwner: false,
    hasExpired: false,
    symbol: 'oWETH $360 Put 12/25/20',
    transactionFee: 0,
    strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    underlyingExp: '-18',
    collateralExp: '-6',
    oTokenExchangeRate: 1e-7,
    minCollateralizationRatio: 1,
    strikePrice: 0.000036,
    collateral: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    expiry: '1608883200'
  },
  ....
]
```
You can fetch the cost of oTokens using premiumToPay();

- @param: oTokenAddress
- @param: paymentTokenAddress
- @param: oTokensToBuy

```
try {
    console.log(await opynConnector.premiumToPay("0xfc19B36158D9a004D3550B7f29ec57eC5EF2dDC9", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 400000000));
} catch(err) {
    console.error("Error: " + err);
}
```

Alternatively, a convenience method is provided so you don't have to do the oToken translation for calls - getPriceOfPurchase()

- @param: oTokenAddress
- @param: isCall
- @param: amountOptionsToBuy
 
This is the equivalent to the above example.

```
try {
    const eth400call = {
        address: '0xfc19b36158d9a004d3550b7f29ec57ec5ef2ddc9',
        name: 'Opyn ETH Call $400 11/27/20',
        isExerciseWindow: true,
        totalSupply: '58045200000',
        decimals: '6',
        liquidationFactor: 0,
        optionsExchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
        underlying: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        COMPOUND_ORACLE: '0x7054e08461e3ecb7718b63540addb3c3a1746415',
        liquidationIncentive: 0,
        owner: '0x87887cf0e37d937f989ab76b99e4f4682da044c4',
        isOwner: false,
        hasExpired: false,
        symbol: 'oETH $400 Call 11/27/20',
        transactionFee: 0,
        strike: '0x0000000000000000000000000000000000000000',
        underlyingExp: '-6',
        collateralExp: '-18',
        oTokenExchangeRate: 0.000001,
        minCollateralizationRatio: 1,
        strikePrice: 2.5e-9,
        collateral: '0x0000000000000000000000000000000000000000',
        expiry: '1606464000'
    }

    console.log(await opynConnector.getPriceOfPurchase(myOption, true, 1));
} catch(err) {
    console.error("Error: " + err);
}
```

It also works for puts:

```
try {
    const eth400put = {
            address: '0x83cbbc045bd86ca1435e9d3e2f5fe29373d532ce',
            name: 'Opyn WETH Put $400 11/06/20',
            isExerciseWindow: true,
            totalSupply: '2288930617',
            decimals: '7',
            liquidationFactor: 0,
            optionsExchange: '0x39246c4f3f6592c974ebc44f80ba6dc69b817c71',
            underlying: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            COMPOUND_ORACLE: '0x7054e08461e3ecb7718b63540addb3c3a1746415',
            liquidationIncentive: 0,
            owner: '0x87887cf0e37d937f989ab76b99e4f4682da044c4',
            isOwner: false,
            hasExpired: false,
            symbol: 'oWETH $400 Put 11/06/20',
            transactionFee: 0,
            strike: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            underlyingExp: '-18',
            collateralExp: '-6',
            oTokenExchangeRate: 1e-7,
            minCollateralizationRatio: 1,
            strikePrice: 0.000039999999999999996,
            collateral: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            expiry: '1604649600'
        };

    console.log(await opynConnector.getPriceOfPurchase(eth400put, false, 1));
} catch(err) {
    console.error("Error: " + err);
}
```

### Examples

There's example code in the examples folder. To use this you can rename the .env.example file to .env and change your infura project id in the file. If using a local node, replace the provider in the example with the RPC url of your local node before running.

```
node examples/examples.js
```