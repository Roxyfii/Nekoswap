"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Abi from "../Data/Abi";
import { useAccount } from "wagmi";

type Pool = {
  id: number;
  TokenReward: string;
  name: string;
  amount: number;
  apr: number;
  status: string;
  logo: string;
  contractAddress: string;
  decimalsReward: number;
  decimalsStake: number;
};

interface PoolListProps {
  pools: Pool[];
}

const PoolList: React.FC<PoolListProps> = ({ pools }) => {
  const { address, isConnected } = useAccount();
  const [stakeAmounts, setStakeAmounts] = useState<Record<number, string>>({});
  const [userStakes, setUserStakes] = useState<Record<number, string>>({});
  const [claimableRewards, setClaimableRewards] = useState<Record<number, string>>({});
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Set signer when wallet connected
  useEffect(() => {
    if (!isConnected) {
      setSigner(null);
      return;
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      provider
        .getSigner()
        .then(setSigner)
        .catch(() => setSigner(null));
    }
  }, [isConnected]);

  const getContract = useCallback(
    (contractAddress: string) => {
      if (!signer) throw new Error("Wallet not connected");
      return new ethers.Contract(contractAddress, Abi, signer);
    },
    [signer]
  );

  // Fetch user stake and claimable reward per pool
  const fetchUserData = useCallback(
    async (pool: Pool) => {
      if (!signer || !address) return;

      try {
        const contract = getContract(pool.contractAddress);

        const rawStake = await contract.getStakedAmount(address);
        const stakeDecimal = parseFloat(ethers.formatUnits(rawStake, pool.decimalsStake));
        setUserStakes((prev) => ({
          ...prev,
          [pool.id]: stakeDecimal.toFixed(1),
        }));

        const rawReward = await contract.getClaimableReward(address);
        const rewardDecimal = parseFloat(ethers.formatUnits(rawReward, pool.decimalsReward));
        setClaimableRewards((prev) => ({
          ...prev,
          [pool.id]: rewardDecimal.toFixed(1),
        }));
      } catch (err) {
        console.error(`Fetch user data error pool ${pool.id}:`, err);
      }
    },
    [signer, address, getContract]
  );

  // Fetch all pools data every 10 seconds
  useEffect(() => {
    if (!signer || !isConnected || pools.length === 0) return;

    pools.forEach(fetchUserData);
    const interval = setInterval(() => {
      pools.forEach(fetchUserData);
    }, 10000);

    return () => clearInterval(interval);
  }, [signer, isConnected, pools, fetchUserData]);

  // Handlers
  const handleStake = async (pool: Pool) => {
    const amountStr = stakeAmounts[pool.id];
    if (!signer || !amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const contract = getContract(pool.contractAddress);
      const amountWei = ethers.parseUnits(amount.toString(), pool.decimalsStake);
      const tx = await contract.stake(amountWei);
      await tx.wait();
      alert(`Staked ${amount} ${pool.name} successfully!`);
      fetchUserData(pool);
      setStakeAmounts((prev) => ({ ...prev, [pool.id]: "" }));
    } catch (e: any) {
      alert("Stake failed: " + (e?.message || e));
    }
  };

  const handleUnstake = async (pool: Pool) => {
    const amountStr = stakeAmounts[pool.id];
    if (!signer || !amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const contract = getContract(pool.contractAddress);
      const amountWei = ethers.parseUnits(amount.toString(), pool.decimalsStake);
      const tx = await contract.unstake(amountWei);
      await tx.wait();
      alert(`Unstaked ${amount} ${pool.name} successfully!`);
      fetchUserData(pool);
      setStakeAmounts((prev) => ({ ...prev, [pool.id]: "" }));
    } catch (e: any) {
      alert("Unstake failed: " + (e?.message || e));
    }
  };

  const handleHarvest = async (pool: Pool) => {
    if (!signer) return;

    try {
      const contract = getContract(pool.contractAddress);
      const tx = await contract.claimReward();
      await tx.wait();
      alert(`Harvested rewards from ${pool.name} successfully!`);
      fetchUserData(pool);
    } catch (e: any) {
      alert("Harvest failed: " + (e?.message || e));
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <p className="mb-4">Please connect your wallet to see pools and stake.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {pools.map((pool) => (
        <div
          key={pool.id}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 border border-gray-200 max-w-sm w-full"
        >
          <div className="flex items-center gap-4 mb-4">
            <img src={`/images/${pool.logo}`} alt={pool.name} className="w-12 h-12 rounded-full" />
            <div>
              <h2 className="text-xl font-semibold">{pool.name}</h2>
              <p>APR: {pool.apr}%</p>
              <p>Status: {pool.status}</p>
            </div>
          </div>

          <p>User Stake: {userStakes[pool.id] ?? "-"} tokens</p>
          <p>Claimable Reward: {claimableRewards[pool.id] ?? "-"} {pool.TokenReward}</p>

          <input
            type="number"
            min="0"
            step="any"
            placeholder="Amount"
            className="mt-3 w-full rounded border border-gray-300 p-2"
            value={stakeAmounts[pool.id] || ""}
            onChange={(e) =>
              setStakeAmounts((prev) => ({ ...prev, [pool.id]: e.target.value }))
            }
          />

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleStake(pool)}
              className="flex-1 bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700"
            >
              Stake
            </button>
            <button
              onClick={() => handleUnstake(pool)}
              className="flex-1 bg-red-600 text-white rounded px-3 py-2 hover:bg-red-700"
            >
              Unstake
            </button>
          </div>

          <button
            onClick={() => handleHarvest(pool)}
            className="mt-3 w-full bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700"
          >
            Harvest
          </button>
        </div>
      ))}
    </div>
  );
};

export default PoolList;
