import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import './CreateProduct.css'; // Import the CSS file for styling


function CreateProduct() {
  const [inputValue, setInputValue] = useState('');
  const [hashValue, setHashValue] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [hedBinWriterURL, setHedBinWriterURL] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleRewardChange = (e) => {
    setRewardAmount(e.target.value);
  };

  const handleURLChange = (e) => {
    setHedBinWriterURL(e.target.value);
  };

  const handleButtonClick = () => {
    const saltRounds = 10;

    bcrypt.hash(inputValue, saltRounds, (err, hash) => {
      if (err) {
        console.error(err);
      } else {
        hash = hash.replace(/\//g, '0');
        hash = hash.slice(5, 13);

        setHashValue(hash);
        sendRequest(hash);
      }
    });
  };

  const sendRequest = (hash) => {
    const url = `http://${hedBinWriterURL}?productId=${hash}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add product.');
        }
        console.log('Product added successfully!');
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const flashTag = (hash) => {
    const url = `http://${hedBinWriterURL}?productId=${hash}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add product.');
        }
        console.log('Product added successfully!');
        console.log(response);
        alert('Tag Flashed successfully!');
      })
      .catch((error) => {
        console.error(error);
      });
      alert('Error: Failed to Flash the Tag!');
  };

  const isURLValid = hedBinWriterURL.trim() !== '';
  const buttonColor = isURLValid ? 'bg-green-500' : 'bg-gray-500';
  const hoverColor = isURLValid ? 'hover:bg-green-600' : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  create-product-container">
      <h1 className="text-6xl mt-10 mb-8 text-center">
        <span className="text-green-500 font-bold">HedBin</span> <span className='text-white'>Product Manufacturing Simulator</span>
      </h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full text-xl px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg"
          placeholder="Enter a product S.No."
        />
        <input
          type="text"
          value={rewardAmount}
          onChange={handleRewardChange}
          className="w-full text-xl px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg"
          placeholder="Tiny Bar Reward Amount"
        />
        <button
          onClick={handleButtonClick}
          className={`w-full text-xl px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg ${hoverColor}`}
        >
          Create Product
        </button>
        {hashValue && (
          <>
            <p className="mt-4 text-xl text-white">Product Hash: {hashValue}</p>
            {(
              <input
                type="text"
                value={hedBinWriterURL}
                onChange={handleURLChange}
                className="w-full text-xl px-4 py-2 mt-4 bg-gray-700 text-white rounded-lg"
                placeholder="HedBin Writer's URL"
              />
            )}
            <button
              onClick={() => flashTag(hashValue)}
              className={`w-full text-xl px-4 py-2 mt-4 ${buttonColor} text-white rounded-lg ${hoverColor}`}
              disabled={!isURLValid}
            >
              Flash the Tag
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateProduct;
