import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
import { Button, Stack, Typography, CircularProgress, useMediaQuery } from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { GlobalAppContext } from "./contexts/GlobalAppContext";
import { sendHbar, claimReward } from "./services/hederaService";
import Confetti from "react-confetti";
import { useParams } from "react-router-dom";

export default function Home() {
  const { metamaskAccountAddress } = useContext(GlobalAppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [claimErrorMessage, setClaimErrorMessage] = useState("");
  const { productHash } = useParams();
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  // ... existing code ...

  const handleTransfer = async () => {
    if (metamaskAccountAddress) {
      try {
        setIsLoading(true);
        const response = await claimReward(AccountId.fromEvmAddress(0, 0, metamaskAccountAddress), productHash!);
        if (response.message === "Reward redeemed successfully") {
          setShowConfetti(true);
          setRewardClaimed(true);
        } else if (response.status === "fail" && response.message === "Product already redeemed") {
          setClaimErrorMessage("Invalid product or already redeemed :(");
        }
      } catch (error) {
        console.error("Error transferring HBAR:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please connect your MetaMask account first");
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
      <Stack
        spacing={4}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: isSmallScreen ? '2rem' : 0, // Add padding for smaller screens
        }}
      >
        {rewardClaimed ? (
          <Typography
            variant="h4"
            color="white"
            textAlign={'center'}
            fontSize={isSmallScreen ? '2rem' : '4rem'} // Adjust font size for smaller screens
          >
            Congratulations! You have successfully claimed your reward!
          </Typography>
        ) : (
          <>
            {claimErrorMessage ? (
              <Typography
                variant="h4"
                color="white"
                textAlign={'center'}
                fontSize={isSmallScreen ? '2rem' : '4rem'} // Adjust font size for smaller screens
              >
                {claimErrorMessage}
              </Typography>
            ) : (
              <Typography
                variant="h4"
                color="white"
                textAlign={'center'}
                fontSize={isSmallScreen ? '2rem' : '4rem'} // Adjust font size for smaller screens
              >
                Connect your MetaMask account to claim your HBAR!
              </Typography>
            )}
            {!claimErrorMessage && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTransfer}
                disabled={isLoading}
                sx={{
                  position: 'relative',
                  fontSize: isSmallScreen ? '1.5rem' : '2rem', // Adjust font size for smaller screens
                  fontWeight: 'bold',
                  padding: isSmallScreen ? '1rem' : '1rem 2rem', // Adjust padding for smaller screens
                  borderRadius: '2rem',
                  '& .MuiCircularProgress-root': {
                    color: 'white',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  },
                }}
              >
                {isLoading && <CircularProgress size={24} />} Claim Your HBAR!
              </Button>
            )}
          </>
        )}
      </Stack>
    </div>
  );
}
