require('dotenv').config()

const Web3 = require("web3");
const OpynConnector = require("../main/connector");

let web3 = new Web3(
    new Web3.providers.HttpProvider(`https://${process.env.NETWORK}.infura.io/v3/${process.env.PROJECT_ID}`)
);

async function exampleFetchOptionsAndPrice() {
    const opynConnector = new OpynConnector({
        web3
    });

    try {
        await opynConnector.init();
        console.log(opynConnector.optionsContracts);
        console.log(await opynConnector.premiumToPay("0xfc19B36158D9a004D3550B7f29ec57eC5EF2dDC9", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 400000000));

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
        };

        console.log(await opynConnector.getPriceOfPurchase(eth400call, true, 1));
    } catch(err) {
        console.error("Error: " + err);
    }
}

exampleFetchOptionsAndPrice();