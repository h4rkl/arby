const {PublicKey} = require('@solana/web3.js');

/**
 * @param {Token[]} tokens
 * @param {Jupiter} jupiter
 * @param {Token} inputToken?
 * @returns
 */
const getPossiblePairsTokenInfo = ({tokens, jupiter, inputToken}) => {
  try {
    if (!inputToken) {
      return {};
    }

    const routeMap = jupiter.getRouteMap();

    const possiblePairs = inputToken
      ? routeMap.get(inputToken.address) || []
      : []; // Return an array of token mints that can be swapped with SOL
    const possiblePairsTokenInfo = {};
    for (const address of possiblePairs) {
      possiblePairsTokenInfo[address] = tokens.find((t) => {
        return t.address == address;
      });
    }

    // Perform your conditionals here to use other outputToken
    // const alternativeOutputToken = possiblePairsTokenInfo[USDT_MINT_ADDRESS]
    return possiblePairsTokenInfo;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Jupiter} jupiter
 * @param {PublicKey} inputToken,
 * @param {PublicKey} outputToken,
 * @param {number} inputAmount,
 * @param {number} slippage,
 * @returns
 */
const getRoutes = async ({
  jupiter,
  inputToken,
  outputToken,
  inputAmount,
  slippage,
}) => {
  try {
    console.log(inputToken, outputToken);
    if (!inputToken || !outputToken) {
      return null;
    }

    console.log(
      `Getting routes for ${inputAmount} ${inputToken.symbol} -> ${outputToken.symbol}...`,
    );
    const inputAmountInSmallestUnits = inputToken
      ? Math.round(inputAmount * 10 ** inputToken.decimals)
      : 0;
    const routes =
      inputToken && outputToken
        ? await jupiter.computeRoutes({
            inputMint: new PublicKey(inputToken.address),
            outputMint: new PublicKey(outputToken.address),
            inputAmount: inputAmountInSmallestUnits, // Raw input amount of tokens
            slippage,
            forceFetch: true,
          })
        : null;

    if (routes && routes.routesInfos) {
      console.log('Possible number of routes:', routes.routesInfos.length);
      console.log(
        'Best quote:',
        routes.routesInfos[0].outAmount / 10 ** outputToken.decimals,
        `(${outputToken.symbol})`,
      );
      return routes;
    }

    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Jupiter} jupiter
 * @param {RouteInfo} routeInfo
 */
const executeSwap = async ({jupiter, routeInfo}) => {
  try {
    // Prepare execute exchange
    const {execute} = await jupiter.exchange({
      routeInfo,
    });

    // Execute swap
    const swapResult = await execute(); // Force any to ignore TS misidentifying SwapResult type

    if (swapResult.error) {
      console.log(swapResult.error);
    } else {
      console.log(`https://explorer.solana.com/tx/${swapResult.txid}`);
      console.log(
        `inputAddress=${swapResult.inputAddress.toString()} outputAddress=${swapResult.outputAddress.toString()}`,
      );
      console.log(
        `inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`,
      );
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {getPossiblePairsTokenInfo, getRoutes, executeSwap};
