const https = require("https");
const chalk = require("chalk");

/*
* Setup: set environment variable named quoteapikey to your free ApiKey value from AlphaVantage
* Install: npm install
* Usage: npm start GE
*/

const basePath = "/query?function=TIME_SERIES_DAILY&outputsize=compact";

var symbol = "";
var apiKey = process.env.quoteapikey || "";

var options = {
    host: "www.alphavantage.co",
    port: 443,
    method: "GET",
    path: ""
};

function logParameterWarning() {
    console.log(chalk.yellowBright("symbol parameter required: npm start MSFT"));
}

function logApiKeyWarning() {
    console.log(chalk.yellowBright("env variable required: quoteapikey"));
}

function logRequestError(error) {
    console.log(chalk.red("error: " + error));
}

if (apiKey.trim().length === 0) {
    logApiKeyWarning();
    return;
}

if (process.argv.length !== 3) {
    logParameterWarning();
    return;
}

symbol = process.argv[2].trim();

if (symbol.length === 0) {
    logParameterWarning();
    return;
}

options.path = basePath + "&symbol=" + symbol + "&apikey=" + apiKey;

const req = https.request(options, function (res) {
    var body = "";
    res.setEncoding("utf8");

    res.on("data", function (data) {
        body += data;
    });

    res.on("end", function () {
        var obj = JSON.parse(body);

        console.log("symbl:\t" + symbol);

        console.log("time:\t" + obj["Meta Data"]["3. Last Refreshed"]);

        var mostRecent = Object.keys(obj["Time Series (Daily)"])[0];

        var today = obj["Time Series (Daily)"][mostRecent];

        console.log("close:\t" + today["4. close"]);

        console.log("open:\t" + today["1. open"]);
        console.log("high:\t" + today["2. high"]);
        console.log("low:\t" + today["3. low"]);
        console.log("volume:\t" + today["5. volume"]);
    });
});

req.on("error", function (e) {
    logRequestError(e);
});

req.end();