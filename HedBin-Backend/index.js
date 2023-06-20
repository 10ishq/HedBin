const {
  Client,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/productModel");

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/" ,  async(req,res) => {
  res.send("Hello World")
  })

app.use(cors());

// Define a function to send tokens
async function sendTokens(address, amount) {
  try {
    // Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, throw an error
    if (!myAccountId || !myPrivateKey) {
      throw new Error("Environment variables are not set properly");
    }

    // Create your connection to the Hedera network
    const client = Client.forTestnet();

    // Set your account as the client's operator
    client.setOperator(myAccountId, myPrivateKey);

    // Set default max transaction fee & max query payment
    client.setDefaultMaxTransactionFee(new Hbar(200));
    client.setMaxQueryPayment(new Hbar(100));

    // If the address is missing, throw an error
    if (!address) {
      throw new Error("Address parameter is missing");
    }

    // Get the new account ID from the address
    const newAccountId = address;

    console.log("\nNew account ID: " + newAccountId);

    // Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(newAccountId)
      .execute(client);

    console.log(
      "\nNew account balance is: " +
      accountBalance.hbars.toTinybars() +
      " tinybars."
    );

    // Create the transfer transaction
    const sendHbar = await new TransferTransaction()
      .addHbarTransfer(myAccountId, Hbar.fromTinybars(amount ? -amount : -100))
      .addHbarTransfer(newAccountId, Hbar.fromTinybars(amount ? amount : 100))
      .execute(client);

    // Verify the transaction reached consensus
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log(
      "\nThe transfer transaction from my account to the new account was: " +
      transactionReceipt.status.toString()
    );

    // Return success response
    return { message: "Transfer successful" };
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
}

// Update the route handler
app.get("/transfer", async (req, res) => {
  address = req.query.address;
  try {
    // Call the function to send tokens
    const result = await sendTokens(address);

    // Return success response
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/addProduct", async (req, res) => {
  const { productHash, rewardAmount } = req.query;

  try {
    const product = await Product.create({
      productHash,
      rewardAmount,
    });
    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "fail",
      message: "Failed to add the product",
    });
  }
});

app.get("/checkProduct", async (req, res) => {
  const { productHash } = req.query;

  try {
    const product = await Product.findOne({ productHash });
    if (!product) {
      res.status(404).json({
        status: "fail",
        message: "Product not found in the database",
      });
      return;
    }

    if (product.redeemed) {
      res.status(400).json({
        status: "fail",
        message: "Product already redeemed",
      });
      return;
    }

    res.status(200).send(productHash)
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.get("/redeemReward", async (req, res) => {
  const { productHash, address } = req.query;

  try {
    const product = await Product.findOne({ productHash });
    if (!product) {
      res.status(404).json({
        status: "fail",
        message: "Product not found in the database",
      });
      return;
    }

    if (product.redeemed) {
      res.status(400).json({
        status: "fail",
        message: "Product already redeemed",
      });
      return;
    }

    const rewardAmount = product.rewardAmount;

    try {
      


      await sendTokens(address, rewardAmount);
      product.redeemed = true;
      await product.save();

      res.status(200).json({
        status: "success",
        message: "Reward redeemed successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Connection to the database failed:", err);
  });


