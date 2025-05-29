"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Abi from "../Data/Abi";
import { useAccount } from "wagmi";
import { ToastContainer, toast } from 'react-toastify';

type Pool = {
  id: number;
  TokenReward: string;
  name: string;
  amount: number; // total staked, akan di-update dari contract
  apr: number;    // apr, juga akan di-fetch
  status: string;
  logo: string;
  userStake: number;
  rewardToken: number;
  contractAddress: string;
  claimableReward?: number;
  decimalsReward: number;
  decimalsStake: number;
};

interface PoolListProps {
  pools: Pool[];
}

const PoolList: React.FC<PoolListProps> = ({ pools }) => {
  const { address, isConnected } = useAccount();
  

  const [stakeAmounts, setStakeAmounts] = useState<{ [key: number]: string }>({});
  const [userStakes, setUserStakes] = useState<{ [key: number]: string }>({});
  const [claimableRewards, setClaimableRewards] = useState<{ [key: number]: string }>({});
  const [aprMap, setAprMap] = useState<{ [key: number]: string }>({});
  const [totalStakedMap, setTotalStakedMap] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [nativeFees, setNativeFees] = useState<{ [key: number]: ethers.BigNumberish }>({});
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const getContract = useCallback(
    (address: string): ethers.Contract => {
      if (!signer) throw new Error("Wallet not connected");
      return new ethers.Contract(address, Abi, signer);
    },
    [signer]
  );

  // Set signer on wallet connect
  useEffect(() => {
    const init = async () => {
      if (typeof window !== "undefined" && window.ethereum && isConnected && address) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
          const walletSigner = await provider.getSigner();
          setSigner(walletSigner);
        } catch (error) {
          console.error("Failed to get signer", error);
          setSigner(null);
        }
      } else {
        setSigner(null);
      }
    };
    init();
  }, [isConnected, address]);

  // Fetch native fee per pool
  const fetchNativeFee = useCallback(
    async (pool: Pool) => {
      if (!signer) return;
      try {
        const contract = getContract(pool.contractAddress);
        const fee = await contract.nativeFee();
        setNativeFees((prev) => ({ ...prev, [pool.id]: fee }));
      } catch (err) {
        console.error(`Failed to fetch fee for pool ${pool.id}`, err);
        setNativeFees((prev) => ({ ...prev, [pool.id]: ethers.parseEther("0") }));
      }
    },
    [signer, getContract]
  );

  // Fetch user staking data
  const fetchUserStakingData = useCallback(
    async (pool: Pool) => {
      if (!signer || !address) return;

      try {
        const contract = getContract(pool.contractAddress);
        const [userStake, reward] = await Promise.all([
          contract.getUserStaked(address),
          contract.getPendingReward(address),
        ]);

        const userStakeFormatted = new Intl.NumberFormat("id-ID", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(parseFloat(ethers.formatUnits(userStake, pool.decimalsStake)));

        const rewardFormatted = new Intl.NumberFormat("id-ID", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(parseFloat(ethers.formatUnits(reward, pool.decimalsReward)));

        setUserStakes((prev) => ({ ...prev, [pool.id]: userStakeFormatted }));
        setClaimableRewards((prev) => ({ ...prev, [pool.id]: rewardFormatted }));
      } catch (err) {
        console.error(`Error fetching staking data for pool ${pool.id}:`, err);
      }
    },
    [signer, getContract, address]
  );

  // Fetch total staked & APR from contract per pool
  const fetchPoolStats = useCallback(
    async (pool: Pool) => {
      if (!signer) return;

      try {
        const contract = getContract(pool.contractAddress);
        // Total staked
        const totalStaked = await contract.getTotalStaked();
        const totalStakedFormatted = new Intl.NumberFormat("id-ID", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(parseFloat(ethers.formatUnits(totalStaked, pool.decimalsStake)));
        setTotalStakedMap((prev) => ({ ...prev, [pool.id]: totalStakedFormatted }));

        // APR, pastikan fungsi APR di contract ada dan namanya sesuai
        // Jika di contract tidak ada fungsi apr, bisa hardcode atau ambil dari API
        if (typeof contract.getAPR === "function") {
          const aprBig = await contract.getAPR();
          const aprNum = parseFloat(ethers.formatUnits(aprBig, 2)); // asumsi decimals 2 untuk APR
          setAprMap((prev) => ({ ...prev, [pool.id]: aprNum.toFixed(2) }));
        } else {
          // fallback jika contract tidak punya apr function
          setAprMap((prev) => ({ ...prev, [pool.id]: pool.apr.toFixed(2) }));
        }
      } catch (err) {
        console.error(`Failed to fetch pool stats for pool ${pool.id}:`, err);
        setTotalStakedMap((prev) => ({ ...prev, [pool.id]: pool.amount.toLocaleString() }));
        setAprMap((prev) => ({ ...prev, [pool.id]: pool.apr.toFixed(2) }));
      }
    },
    [signer, getContract]
  );

  // On signer, address, or pools update, fetch necessary data
  useEffect(() => {
    if (!signer || !address || pools.length === 0) return;

    pools.forEach((pool) => {
      fetchNativeFee(pool);
      fetchUserStakingData(pool);
      fetchPoolStats(pool);
    });

    const interval = setInterval(() => {
      pools.forEach(fetchUserStakingData);
      pools.forEach(fetchPoolStats);
    }, 10000);

    return () => clearInterval(interval);
  }, [signer, address, pools, fetchNativeFee, fetchUserStakingData, fetchPoolStats]);

  // Wrapper to set loading state during async calls
  const withLoading =
    (poolId: number, fn: () => Promise<void>) =>
    async () => {
      try {
        setLoading((prev) => ({ ...prev, [poolId]: true }));
        await fn();
      } finally {
        setLoading((prev) => ({ ...prev, [poolId]: false }));
      }
    };

  const handleStake = (pool: Pool) =>
    withLoading(pool.id, async () => {
      if (!signer) return;

      const input = stakeAmounts[pool.id];
      const amount = parseFloat(input);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Transaksi gagal");
        return;
      }

      try {
        const contract = getContract(pool.contractAddress);
        const value = nativeFees[pool.id] ?? ethers.parseEther("0");
        const amountInWei = ethers.parseUnits(amount.toString(), pool.decimalsStake);

        const tx = await contract.stake(amountInWei, { value });
        await tx.wait();

        toast.success("Stake berhasil!");

        fetchUserStakingData(pool);
        setStakeAmounts((prev) => ({ ...prev, [pool.id]: "" }));
      } catch (error) {
        console.error("❌ Staking failed:", error);
        toast.error("Transaksi gagal");
      }
    })();

  const handleUnstake = (pool: Pool) =>
    withLoading(pool.id, async () => {
      const input = stakeAmounts[pool.id];
      const amount = parseFloat(input);
      if (isNaN(amount) || amount <= 0 || !signer) {
        toast.error("Transaksi gagal");
        return;
      }

      try {
        const contract = getContract(pool.contractAddress);
        const amountInWei = ethers.parseUnits(amount.toString(), pool.decimalsStake);
        const tx = await contract.unstake(amountInWei);
        await tx.wait();

        toast.success("Unstake berhasil!");

        fetchUserStakingData(pool);
        setStakeAmounts((prev) => ({ ...prev, [pool.id]: "" }));
      } catch (err) {
        console.error("Unstake error:", err);
        toast("Unstake Failed");
      }
    })();

  const handleHarvest = (pool: Pool) =>
    withLoading(pool.id, async () => {
      if (!signer) return;
      try {
        const contract = getContract(pool.contractAddress);
        const tx = await contract.claimReward();
        await tx.wait();

        toast( "Harvest Successful");

        fetchUserStakingData(pool);
      } catch (err) {
        console.error("Harvest error:", err);
        toast("Harvest Failed" );
      }
    })();

  return (
    <div className="gap-5 flex justify-center items-center flex-wrap">
      {pools.map((pool) => (
        <div
          key={pool.id}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 border border-gray-200 max-w-sm w-full"
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src={`/images/${pool.logo}`}
              alt={pool.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{pool.name}</h2>
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
              <p>{totalStakedMap[pool.id] ?? pool.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">APR</p>
              <p>{aprMap[pool.id] ?? pool.apr.toFixed(2)}%</p>
            </div>
            <div>
              <p className="font-medium">Your Stake</p>
              <p>{userStakes[pool.id] ?? "0"}</p>
            </div>
            <div>
              <p className="font-medium">Earned</p>
              <p>{claimableRewards[pool.id] ?? "0"}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              min={0}
              step="any"
              placeholder="Amount"
              value={stakeAmounts[pool.id] ?? ""}
              onChange={(e) =>
                setStakeAmounts((prev) => ({ ...prev, [pool.id]: e.target.value }))
              }
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              disabled={loading[pool.id]}
              onClick={() => handleStake(pool)}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading[pool.id] ? "Processing..." : "Stake"}
            </button>
            <button
              disabled={loading[pool.id]}
              onClick={() => handleUnstake(pool)}
              className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 disabled:bg-red-300"
            >
              {loading[pool.id] ? "Processing..." : "Unstake"}
            </button>
            <button
              disabled={loading[pool.id]}
              onClick={() => handleHarvest(pool)}
              className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 disabled:bg-green-300"
            >
              {loading[pool.id] ? "Processing..." : "Harvest"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PoolList;
