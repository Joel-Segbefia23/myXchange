import express from "express";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();  // Loads the .env file into process.env

const app = express();
const port = process.env.PORT || 3000;  //still work w/o fallback but its bestpractise!.
const apiKey = process.env.API_key;


app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", async (req, res) => {
    try {
        const ipAddress = await axios.get(`https://api.ipify.org?format=json`);
        const ip = ipAddress.data.ip;

        console.log("Detected IP Address:", ip);

        const locationFinder = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCnName,ode,region,regiocity,zip,lat,lon,timezone,currency,isp,org,as,query`);
        const nativeCurrency = locationFinder.data.currency;

        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${nativeCurrency}`);
        const conversionRate = response.data.conversion_rates;

        res.render("index.ejs", {
            localRate: nativeCurrency,
            details: response.data,
            usdRate: conversionRate.USD,
            eurRate: conversionRate.EUR,
            gbpRate: conversionRate.GBP
        });

    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).send("An error occurred while fetching data.");
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});