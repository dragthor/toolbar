const https = require("https");
const chalk = require("chalk");

/*
* Setup: set environment variable named quoteapikey to your free ApiKey value from AlphaVantage
* Install: npm install
* Usage: npm start GE,ED,MSFT
*/

const host = "www.alphavantage.co";
const port = 443;
const basePath = "/query?function=TIME_SERIES_INTRADAY&outputsize=compact&interval=15min";

var apiKey = process.env.quoteapikey || "";

function logParameterWarning() {
    console.log(chalk.yellowBright("symbol parameter required: npm start MSFT"));
}

function logApiKeyWarning() {
    console.log(chalk.yellowBright("env variable required: quoteapikey"));
}

function logRequestError(ticker, error) {
    console.log(chalk.red(ticker + " error: " + error));
}

function logOutput(name, value) {
    console.log(name + ":\t" + value);
}

if (apiKey.trim().length === 0) {
    logApiKeyWarning();
    return;
}

if (process.argv.length !== 3) {
    logParameterWarning();
    return;
}

const symbols = process.argv[2].trim();

if (symbols.length === 0) {
    logParameterWarning();
    return;
}

const tickers = symbols.split(",");

for (let i = 0; i < tickers.length; i++) {
    getQuote(tickers[i]);
}

function getQuote(ticker) {
    var options = {
        host: host,
        port: port,
        method: "GET",
        path: basePath + "&symbol=" + ticker + "&apikey=" + apiKey
    };

    // console.log(options.host + options.path);

    const req = https.request(options, function (res) {
        var body = "";
        res.setEncoding("utf8");

        res.on("data", function (data) {
            body += data;
        });

        res.on("end", function () {
            try {
                var obj = JSON.parse(body);
                var mostRecent = Object.keys(obj["Time Series (15min)"])[0];
                var today = obj["Time Series (15min)"][mostRecent];

                console.log("-----------------------------------------");

                logOutput("time", obj["Meta Data"]["3. Last Refreshed"]);

                logOutput("symbol", ticker);

                var currentPrice = parseFloat(today["4. close"]);
                var openPrice = parseFloat(today["1. open"]);

                if (currentPrice == openPrice) {
                    logOutput("price", currentPrice);
                } else if (currentPrice < openPrice) {
                    logOutput("price", chalk.red.inverse(currentPrice));
                } else {
                    logOutput("price", chalk.green.inverse(currentPrice));
                }

                logOutput("open", today["1. open"]);
                logOutput("high", today["2. high"]);
                logOutput("low", today["3. low"]);
                logOutput("volume", today["5. volume"]);
            } catch (err) {
                logRequestError(ticker, err);
            }
        });
    });

    req.on("error", function (e) {
        logRequestError(ticker, e);
    });

    req.end();
}