"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import Farming from "../Data/Farming";

type Pool = {
  id: number;
  TokenReward: string;
  name: string;
  apr: number;
  status: string;
  logo: string;
  contractAddress: string;
  decimalsReward: number;
  decimalsStake: number;
};

interface FarmingProps {
  farms: Pool[];
}

const Farms: React.FC<FarmingProps> = ({ farms }) => {
  const { address, isConnected } = useAccount();

  const [stakeAmounts, setStakeAmounts] = useState<{ [key: number]: string }>({});
  const [userStakes, setUserStakes] = useState<{ [key: number]: string }>({});
  const [claimableRewards, setClaimableRewards] = useState<{ [key: number]: string }>({});
  const [totalStaked, setTotalStaked] = useState<{ [key: number]: string }>({});
  const [aprValues, setAprValues] = useState<{ [key: number]: string }>({});
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const getContract = useCallback(
    (address: string): ethers.Contract => {
      if (!signer) throw new Error("Wallet not connected");
      return new ethers.Contract(address, Farming, signer);
    },
    [signer]
  );

  useEffect(() => {
    const init = async () => {
      if (typeof window !== "undefined" && window.ethereum && isConnected && address) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
          const walletSigner = await provider.getSigner();
          setSigner(walletSigner);
        } catch (error) {
          console.error("Failed to get signer", error);
        }
      } else {
        setSigner(null);
      }
    };
    init();
  }, [isConnected, address]);

  const fetchUserStakingData = useCallback(
    async (pool: Pool) => {
      if (!signer || !address) return;

      try {
        const contract = getContract(pool.contractAddress);

        // Get user stake
        const userStake = await contract.getUserStaked(address);
        const stakeInDecimal = parseFloat(ethers.formatUnits(userStake, pool.decimalsStake));
        setUserStakes((prev) => ({
          ...prev,
          [pool.id]: stakeInDecimal.toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        }));

        // Get claimable rewards
        const reward = await contract.getPendingReward(address);
        const rewardDecimal = parseFloat(ethers.formatUnits(reward, pool.decimalsReward));
        setClaimableRewards((prev) => ({
          ...prev,
          [pool.id]: rewardDecimal.toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        }));

        // Get total staked
        const total = await contract.getTotalStaked();
        const totalDecimal = parseFloat(ethers.formatUnits(total, pool.decimalsStake));
        setTotalStaked((prev) => ({
          ...prev,
          [pool.id]: totalDecimal.toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        }));

        // Get APR
        const apr = await contract.getAPR();
        setAprValues((prev) => ({
          ...prev,
          [pool.id]: parseFloat(apr.toString()).toFixed(0),
        }));

      } catch (err) {
        console.error(`Error fetching staking data for pool ${pool.id}:`, err);
      }
    },
    [signer, getContract, address]
  );

  useEffect(() => {
    if (!signer || !address || farms.length === 0) return;

    farms.forEach((pool) => fetchUserStakingData(pool));

    const interval = setInterval(() => {
      farms.forEach((pool) => fetchUserStakingData(pool));
    }, 10000);

    return () => clearInterval(interval);
  }, [signer, address, farms, fetchUserStakingData]);

  const handleStake = async (pool: Pool) => {
    const input = stakeAmounts[pool.id];
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0 || !signer) return;

    try {
      const contract = getContract(pool.contractAddress);
      const amountInWei = ethers.parseUnits(amount.toString(), pool.decimalsStake);
      const tx = await contract.stake(amountInWei);
      await tx.wait();
      fetchUserStakingData(pool);
      setStakeAmounts((prev) => ({ ...prev, [pool.id]: "" }));
    } catch (err) {
      console.error("Stake error:", err);
      alert("Stake failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleUnstake = async (pool: Pool) => {
    const input = stakeAmounts[pool.id];
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0 || !signer) return;

    try {
      const contract = getContract(pool.contractAddress);
      const amountInWei = ethers.parseUnits(amount.toString(), pool.decimalsStake);
      const tx = await contract.unstake(amountInWei);
      await tx.wait();
      fetchUserStakingData(pool);
      setStakeAmounts((prev) => ({ ...prev, [pool.id]: "" }));
    } catch (err) {
      console.error("Unstake error:", err);
      alert("Unstake failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleHarvest = async (pool: Pool) => {
    if (!signer) return;

    try {
      const contract = getContract(pool.contractAddress);
      const tx = await contract.claimReward();
      await tx.wait();
      fetchUserStakingData(pool);
    } catch (err) {
      console.error("Harvest error:", err);
      alert("Harvest failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="gap-5 flex justify-center items-center flex-wrap">
      {farms.map((pool) => (
        <div
          key={pool.id}
          className="bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-900 dark:via-zinc-800 dark:to-green-900 rounded-2xl shadow-lg p-6 border-2 border-green-400 max-w-sm w-full relative"
        >
          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-green-600 text-white font-bold">
            FARMS
          </span>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={`/images/${pool.logo}`}
              alt={pool.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                🌿 {pool.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{pool.TokenReward} Reward</p>
            </div>
            <span
              className={`ml-auto px-3 py-1 text-sm rounded-full font-medium ${
                pool.status.toLowerCase() === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              {pool.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mb-4">
            <div>
              <p className="font-medium">Total Staked</p>
              <p className="text-lg font-semibold">{totalStaked[pool.id] ?? "..."}</p>
            </div>
            <div>
              <p className="font-medium">APR</p>
              <p className="text-sm font-semibold">{aprValues[pool.id] ?? "..."}%</p>
            </div>
            <div>
              <p className="font-medium">Your Stake</p>
              <p className="text-lg font-semibold">{userStakes[pool.id] ?? "0"}</p>
            </div>
            <div>
              <p className="font-medium">{pool.TokenReward} Earned</p>
              <p className="text-lg font-semibold">{claimableRewards[pool.id] ?? "0"}</p>
            </div>
          </div>

          <input
            type="number"
            inputMode="decimal"
            placeholder="Enter amount"
            value={stakeAmounts[pool.id] ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStakeAmounts((prev) => ({
                ...prev,
                [pool.id]: e.target.value,
              }))
            }
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-gray-600 dark:text-white"
            disabled={pool.status.toLowerCase() === "inactive"}
            min="0"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleStake(pool)}
              disabled={pool.status.toLowerCase() === "inactive"}
              className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${
                pool.status.toLowerCase() === "inactive"
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => handleUnstake(pool)}
              disabled={pool.status.toLowerCase() === "inactive"}
              className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${
                pool.status.toLowerCase() === "inactive"
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Unstake
            </button>
            <button
              onClick={() => handleHarvest(pool)}
              disabled={pool.status.toLowerCase() === "inactive"}
              className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${
                pool.status.toLowerCase() === "inactive"
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Harvest
            </button>
          </div>
        </div>
      ))}

      <div className="flex-1 flex justify-center">
        <img
          src="/images/farms.png"
          alt="Nekoswap Tokenomics Illustration"
          className="max-w-sm w-32"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Farms;
