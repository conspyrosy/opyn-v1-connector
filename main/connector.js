const batchRequest = require('web3-batch-request');

const FACTORY_ABI = require('../abi/factory.json');
const EXCHANGE_ABI = require('../abi/exchange.json');
const OTOKEN_ABI = require('../abi/otoken.json');
const { convertToFloatingPoint } = require('../utils/utils');

class OpynConnector {
    constructor({
        web3,
        config
    }) {
        if (!web3) {
            throw new Error("You must pass in a web3 instance");
        }

        if (!config) {
            this.config = require('../constants/mainnet.json');
        } else {
            this.config = config;
        }

        this.web3 = web3;
    }

    getDefaultFilters() {
        const filterExpired = option => option.expiry > Math.floor(Date.now() / 1000);
        return [filterExpired];
    }

    /**
     * Fetch all options from the factory and filter using the filters passed (if any - by default filters expired out)
     *
     * @param filters array of filters to run options through. by default filters any expired options.
     * @returns array of options, filtered if any specified.
     */
    async init({ filters } = { filters: this.getDefaultFilters() }) {
        await this.getOptionsContractAddresses();
        let optionsInfo = await this.getOptionsInformation(this.optionsAddresses);
        this.optionsContracts = this.filterOptionsContracts(optionsInfo, filters);
        return this.optionsContracts;
    }

    getOptionsContractAddresses() {
        return new Promise((resolve, reject) => {
            new this.web3.eth.Contract(FACTORY_ABI, this.config.factory).methods.getNumberOfOptionsContracts().call().then(
                numberOfOptions => {
                    let calls = [...Array(parseInt(numberOfOptions)).keys()].map(optionKey => ({
                        ethCall: new this.web3.eth.Contract(FACTORY_ABI, this.config.factory).methods.optionsContracts(optionKey).call
                    }));

                    batchRequest.makeBatchRequest(this.web3, calls).then(
                        result => {
                            this.optionsAddresses = result;
                            resolve(result);
                        }
                    ).catch(err => {
                        reject("Failed during fetch of pool addresses " + err);
                    });
                }
            ).catch(
                err => reject("Failed to fetch option contracts count " + err)
            )
        });
    }

    getOptionsInformation(pools, { filters } = { filters: []}) {
        return new Promise((resolve, reject) => {

            let constants = [
                "name", "isExerciseWindow", "totalSupply", "decimals", "liquidationFactor", "optionsExchange",
                "underlying", "COMPOUND_ORACLE", "liquidationIncentive", "owner", "isOwner", "hasExpired",
                "symbol", "transactionFee", "strike", "underlyingExp", "collateralExp", "oTokenExchangeRate",
                "minCollateralizationRatio", "strikePrice", "collateral", "expiry"
            ];

            //fields in this list will be converted to floating points when returned
            let floatingPointFields = ["liquidationFactor", "liquidationIncentive", "transactionFee",
                                       "oTokenExchangeRate", "minCollateralizationRatio", "strikePrice"];

            //fields in this list will be lowercased to prevent any case-sensitivity issues when searching
            let addressFields = ["optionsExchange", "underlying", "COMPOUND_ORACLE", "owner", "strike", "collateral"];

            let calls = pools.map(address =>
                    constants.map(methodName => ({
                        ethCall: new this.web3.eth.Contract(OTOKEN_ABI, address).methods[methodName]().call,
                        onError: err => console.log("Error on: " + address + " " + methodName)
                    })
                )
            ).flat();

            batchRequest.makeBatchRequest(this.web3, calls).then(
                result => {
                    let optionList = [];

                    //theres probably a more elegant way to do this with destructuring...
                    for(let optionIndex = 0; optionIndex < pools.length; optionIndex++) {
                        let currentOption = {};
                        currentOption.address = pools[optionIndex].toLowerCase();
                        for(let propertyIndex = 0; propertyIndex < constants.length; propertyIndex++) {
                            let currentProperty = constants[propertyIndex];
                            let currentPropertyValue = result[(optionIndex * constants.length) + propertyIndex];

                            if(floatingPointFields.includes(currentProperty)) {
                                currentOption[currentProperty] = convertToFloatingPoint(currentPropertyValue);
                            } else if(addressFields.includes(currentProperty)) {
                                currentOption[currentProperty] = currentPropertyValue.toLowerCase();
                            } else {
                                currentOption[currentProperty] = currentPropertyValue;
                            }
                        }

                        optionList.push(currentOption);
                    }

                    this.optionsContracts = optionList;
                    resolve(optionList);
                }
            ).catch(err => {
                reject(err);
            });
        });
    }

    filterOptionsContracts(contracts, filters = []) {
        let filtered = contracts;

        if(filters.length > 0) {
            for(let filterIndex = 0; filterIndex < filters.length; filterIndex++) {
                const currentFilter = filters[filterIndex];
                filtered = contracts.filter(option => currentFilter(option));
            }
        }

        return filtered;
    }

    premiumToPay(oTokenAddress, paymentTokenAddress, oTokensToBuy) {
        return new this.web3.eth.Contract(EXCHANGE_ABI, this.config.exchange).methods.premiumToPay(oTokenAddress, paymentTokenAddress, oTokensToBuy).call();
    }

    getPriceOfPurchase(option, isCall, amountOptionsToBuy, paymentTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48") {
        let oTokensNeeded;

        if(isCall) {
            //todo: shouldnt need rounding - floating point precision issue. fix this!!!
            oTokensNeeded = Math.round(amountOptionsToBuy / option.strikePrice);
        } else {
            //todo: shouldnt need rounding - floating point precision issue. fix this!!!
            oTokensNeeded = Math.round(amountOptionsToBuy * Math.pow(10, option.decimals));
        }

        return this.premiumToPay(option.address, paymentTokenAddress, oTokensNeeded);
    }
}

module.exports = OpynConnector;