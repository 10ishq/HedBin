import MetaMaskSDK from '@metamask/sdk';


const MMSDK = new MetaMaskSDK({
  useDeeplink: false,
  communicationLayerPreference: "socket",
});




export const switchToHederaNetwork = async (ethereum) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x128' }] // chainId must be in hexadecimal numbers
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Hedera Testnet',
                chainId: '0x128',
                nativeCurrency: {
                  name: 'HBAR',
                  symbol: 'HBAR',
                  decimals: 18
                },
                rpcUrls: ['https://testnet.hashio.io/api']
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  }


  // returns a list of accounts
// otherwise empty array
export const connectToMetamask = async () => {
  const ethereum = MMSDK.getProvider(); // You can also access via window.ethereum
    // keep track of accounts returned
    let accounts = []
    if (!ethereum) {
      throw new Error("Metamask is not installed! Go install the extension!");
    }
    
    switchToHederaNetwork(ethereum);
    
    accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts;
  }