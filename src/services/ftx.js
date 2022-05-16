const axios = require('axios');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const sha256 = require('crypto-js/sha256');
const Hex = require('crypto-js/enc-hex');

class FtxClient {
  constructor(apiKey, apiSecretKey /* , subaccount */) {
    this.instance = axios.create({
      baseURL: 'https://ftx.com/api/',
      timeout: 5000,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json; utf-8',
        'FTX-KEY': apiKey,
        // 'FTX-SUBACCOUNT': subaccount
      },
    });

    // Make signature
    this.instance.interceptors.request.use(
      (config) => {
        const now = Date.now();
        const method = config.method.toUpperCase();
        const {data, params} = config;
        let sign = now + method;

        config.headers['FTX-TS'] = now;

        switch (method) {
          case 'GET':
          case 'DELETE':
            sign += `/api/${config.url}?${new URLSearchParams(
              params,
            ).toString()}`;
            break;
          case 'POST':
          case 'PUT':
          case 'PATCH':
            sign += `/api/${config.url}${JSON.stringify(data)}`;
        }

        config.headers['FTX-SIGN'] = hmacSHA256(sign, apiSecretKey).toString(
          Hex,
        );

        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  _get(endpoint, parameters = {}) {
    return this.instance
      .get(endpoint, {params: parameters})
      .then((res) => res.data)
      .catch((error) => console.log(error.toJSON()));
  }

  _delete(endpoint, parameters = {}) {
    return this.instance
      .delete(endpoint, {params: parameters})
      .then((res) => res.data)
      .catch((error) => console.log(error.toJSON()));
  }

  _post(endpoint, data = {}) {
    return this.instance
      .post(endpoint, data)
      .then((res) => res.data)
      .catch((error) => console.log(error.toJSON()));
  }

  getBTCMarket() {
    return this._get(`/markets/BTC/USD`);
  }

  //   GetOrderbook(market, depth = null) {
  //     return this._get(`markets/${market}/orderbook`, { depth })
  //   }
}

module.exports = FtxClient;

// Test code
// const market = 'BTC-0327'
// const now = new Date().getTime() / 1000;
// const price = 100;
// const size = 0.1;
// const side = 'buy';
// const orderType = 'limit'
// const type = 'stop'
//
// ftxClient.listFutures()
// ftxClient.getOrderbook(market)
// ftxClient.placeOrder(market, side, price, size)
// ftxClient.getPositions()
