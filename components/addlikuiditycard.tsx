"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardHeader, CardFooter } from "@heroui/card";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";

import pairAbi from "@/Data/pairABI.json";
import addresses from "@/Data/addresses.json";
import factoryABI from "@/Data/factoryABI.json";
import routerABI from "@/Data/routerABI.json";
import { ERC20_ABI, TOKEN_LIST } from "@/Data/token";

export default function AddLiquidityCard() {
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState<number>(0);
  const [amountB, setAmountB] = useState<number>(0);
  const [balanceA, setBalanceA] = useState("0");
  const [balanceB, setBalanceB] = useState("0");
  const [address, setAddress] = useState<string | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [priceAtoB, setPriceAtoB] = useState(0);

  const isNative = (token: typeof tokenA) => token.isNative;

  const loadBalances = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);

      const balanceANative = await provider.getBalance(addr);
      const tokenAContract = new ethers.Contract(tokenA.address, ERC20_ABI, provider);
      const tokenBContract = new ethers.Contract(tokenB.address, ERC20_ABI, provider);

      setBalanceA(
        isNative(tokenA)
          ? ethers.formatUnits(balanceANative, tokenA.decimals)
          : ethers.formatUnits(await tokenAContract.balanceOf(addr), tokenA.decimals)
      );

      setBalanceB(
        isNative(tokenB)
          ? ethers.formatUnits(await provider.getBalance(addr), tokenB.decimals)
          : ethers.formatUnits(await tokenBContract.balanceOf(addr), tokenB.decimals)
      );
    } catch (err) {
      console.error("Load balances error:", err);
      setBalanceA("0");
      setBalanceB("0");
    }
  };

  const fetchPairInfo = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
      const factory = new ethers.Contract(addresses.factory, factoryABI, provider);
      const pair = await factory.getPair(tokenA.address, tokenB.address);

      if (pair === ethers.ZeroAddress) {
        setPriceAtoB(0);
        return;
      }

      const pairContract = new ethers.Contract(pair, pairAbi, provider);
      const [res0, res1] = await pairContract.getReserves();
      const token0 = await pairContract.token0();

      const isTokenA0 = tokenA.address.toLowerCase() === token0.toLowerCase();
      const reserve0 = res0;
      const reserve1 = res1;

      if (reserve0 === 0n || reserve1 === 0n) {
        setPriceAtoB(0);
        return;
      }

      const price = isTokenA0
        ? Number(ethers.formatUnits(reserve1, tokenB.decimals)) /
          Number(ethers.formatUnits(reserve0, tokenA.decimals))
        : Number(ethers.formatUnits(reserve0, tokenB.decimals)) /
          Number(ethers.formatUnits(reserve1, tokenA.decimals));

      setPriceAtoB(price);
    } catch (err) {
      console.error("fetchPairInfo error:", err);
      setPriceAtoB(0);
    }
  };

  useEffect(() => {
    loadBalances();
    fetchPairInfo();
  }, [tokenA, tokenB]);

  const handleAmountAChange = (val: number) => {
    setAmountA(val);
    if (priceAtoB > 0) {
      setAmountB(Number((val * priceAtoB).toFixed(tokenB.decimals)));
    } else {
      setAmountB(0);
    }
  };

  const handleAmountBChange = (val: number) => {
    setAmountB(val);
  };

  const handleSelectToken = (symbol: string, isA: boolean) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected) return;

    const other = isA ? tokenB : tokenA;
    if (selected.symbol === other.symbol) {
      alert("Token tidak boleh sama.");
      return;
    }
    if (isA) {
      setTokenA(selected);
    } else {
      setTokenB(selected);
    }
    
    setAmountA(0);
    setAmountB(0);
    
  };

  const addLiquidity = async () => {
    if (!window.ethereum || !address) return alert("Hubungkan wallet terlebih dahulu.");
    if (amountA <= 0 || amountB <= 0) return alert("Jumlah tidak valid.");

    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(addresses.Router, routerABI, signer);

      const amountADesired = ethers.parseUnits(amountA.toString(), tokenA.decimals);
      const amountBDesired = ethers.parseUnits(amountB.toString(), tokenB.decimals);
      const slippageFactor = BigInt(Math.floor((1 - slippage / 100) * 10000));
      const amountAMin = (amountADesired * slippageFactor) / 10000n;
      const amountBMin = (amountBDesired * slippageFactor) / 10000n;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const isANative = isNative(tokenA);
      const isBNative = isNative(tokenB);

      if (isANative || isBNative) {
        const token = isANative ? tokenB : tokenA;
        const tokenAmt = isANative ? amountBDesired : amountADesired;
        const ethAmt = isANative ? amountADesired : amountBDesired;
        const tokenMin = isANative ? amountBMin : amountAMin;
        const ethMin = isANative ? amountAMin : amountBMin;

        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, addresses.Router);
        if (allowance < tokenAmt) {
          const txApprove = await tokenContract.approve(addresses.Router, tokenAmt);
          await txApprove.wait();
        }

        const tx = await router.addLiquidityETH(
          token.address,
          tokenAmt,
          tokenMin,
          ethMin,
          address,
          deadline,
          { value: ethAmt }
        );
        await tx.wait();
      } else {
        const tokenAContract = new ethers.Contract(tokenA.address, ERC20_ABI, signer);
        const tokenBContract = new ethers.Contract(tokenB.address, ERC20_ABI, signer);

        const allowanceA = await tokenAContract.allowance(address, addresses.Router);
        if (allowanceA < amountADesired) {
          const txA = await tokenAContract.approve(addresses.Router, amountADesired);
          await txA.wait();
        }

        const allowanceB = await tokenBContract.allowance(address, addresses.Router);
        if (allowanceB < amountBDesired) {
          const txB = await tokenBContract.approve(addresses.Router, amountBDesired);
          await txB.wait();
        }

        const tx = await router.addLiquidity(
          tokenA.address,
          tokenB.address,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          address,
          deadline
        );
        await tx.wait();
      }

      alert("Berhasil menambahkan liquidity!");
      await loadBalances();
    } catch (err) {
      console.error("AddLiquidity error:", err);
      alert("Gagal menambahkan liquidity.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="items-center flex flex-col justify-center">
      <Card className="max-w-[400px] shadow-lg p-5">
        <CardHeader className="flex justify-center items-center gap-2" />
        {/* Token A */}
        <div className="w-full mt-4">
          <p className="text-sm mb-1">Token A</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenA.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenA.symbol]}
              onSelectionChange={(keys) =>
                handleSelectToken(String(Array.from(keys)[0]), true)
              }
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem
                  key={token.symbol}
                  isDisabled={token.symbol === tokenB.symbol}
                >
                  {token.symbol}
                </SelectItem>
              ))}
            </Select>
          </div>
          <NumberInput
            className="w-full mt-2"
            value={amountA}
            onValueChange={(val) => handleAmountAChange(Number(val) || 0)}
            placeholder="0.0"
          />
          <p className="text-xs text-gray-600 mt-1">Balance: {balanceA}</p>
        </div>

        <Divider className="my-4" />

        {/* Token B */}
        <div className="w-full">
          <p className="text-sm mb-1">Token B</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenB.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenB.symbol]}
              onSelectionChange={(keys) =>
                handleSelectToken(String(Array.from(keys)[0]), false)
              }
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem
                  key={token.symbol}
                  isDisabled={token.symbol === tokenA.symbol}
                >
                  {token.symbol}
                </SelectItem>
              ))}
            </Select>
          </div>
          <NumberInput
            className="w-full mt-2"
            value={amountB}
            onValueChange={(val) => handleAmountBChange(Number(val) || 0)}
            placeholder="0.0"
          />
          <p className="text-xs text-gray-600 mt-1">Balance: {balanceB}</p>
        </div>

        <Divider className="my-4" />

        <div className="w-full">
          <p className="text-sm mb-1">Slippage Tolerance (%)</p>
          <NumberInput
            className="w-full"
            value={slippage}
            onValueChange={(val) => setSlippage(Number(val) || 0)}
            min={0}
            max={5}
            step={0.1}
          />
          <p className="mt-4 text-sm">
             1 {tokenA.symbol} = {priceAtoB.toFixed(6)} {tokenB.symbol}
          </p>
        </div>

        <CardFooter className="mt-4">
          <Button
            isLoading={isLoading}
            disabled={
              isLoading || amountA <= 0 || amountB <= 0 || tokenA.symbol === tokenB.symbol
            }
            onClick={addLiquidity}
            className="w-full"
          >
            Add Liquidity
          </Button>
        </CardFooter>
      </Card>
      <div className="flex-1 flex justify-center">
          <img
            src="/images/pohon.png"
            alt="Nekoswap Tokenomics Illustration"
            className="max-w-sm w-24"
            loading="lazy"
          />
        </div>
    </div>
  );
}
