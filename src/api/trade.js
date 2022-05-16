const {Router} = require('express');
const {PublicKey} = require('@solana/web3.js');
const {getRoutes} = require('../services/jup');

const sessionMiddleware = require('../middleware/session-middleware');

const router = new Router();

router.post('/', sessionMiddleware, async (request, response) => {
  const FTX = request.app.get('ftx');
  const jupiter = request.app.get('jupiter');
  const btc = await FTX.getBTCMarket();
  const btc_key = new PublicKey(process.env.BTC_MINT_ADDRESS);
  const usdc_key = new PublicKey(process.env.USDC_MINT_ADDRESS);
  const routes = await getRoutes({
    jupiter,
    inputToken: usdc_key,
    outputToken: btc_key,
    inputAmount: 1, // 1 unit in UI
    slippage: 0.1, // 0.1% slippage
  });
  response.json({btc_price: btc.result.price, routes});
});

module.exports = router;
