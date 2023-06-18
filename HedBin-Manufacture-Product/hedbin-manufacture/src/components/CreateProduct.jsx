import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

function CreateProduct() {
  const [inputValue, setInputValue] = useState('');
  const [hashValue, setHashValue] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleRewardChange = (e) => {
    setRewardAmount(e.target.value);
  };

  const handleButtonClick = () => {
    const saltRounds = 10; // Number of salt rounds for bcrypt hashing

    bcrypt.hash(inputValue, saltRounds, (err, hash) => {
      if (err) {
        console.error(err);
      } else {
        
        hash = hash.replace(/\//g, '0'); // Replace / with 0
        hash = hash.slice(5, 13);

        setHashValue(hash);
        sendRequest(hash);
      }
    });
  };

  const sendRequest = (hash) => {
    const url = `http://localhost:3001/addProduct?productHash=${hash}&rewardAmount=${rewardAmount}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add product.');
        }
        // Handle successful response if needed
        console.log('Product added successfully!');
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const flashTag = (hash) => {
    const url = `http://192.168.29.125/?productId=${hash}`;
  
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add product.');
        }
        // Handle successful response if needed
        console.log('Product added successfully!');
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg"
          placeholder="Enter a product name"
        />
        <input
          type="text"
          value={rewardAmount}
          onChange={handleRewardChange}
          className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg"
          placeholder="Enter the reward amount"
        />
        <button
          onClick={handleButtonClick}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Product
        </button>
        {hashValue && (
          <>
            <p className="mt-4 text-white">Product UID: {hashValue}</p>
            <button
              onClick={() => flashTag(hashValue)}
              className="w-full px-4 py-2 mt-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
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