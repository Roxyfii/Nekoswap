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
  const [balanceA, setBalanceA] = useState<string>("0");
  const [balanceB, setBalanceB] = useState<string>("0");
  const [address, setAddress] = useState<string | null>(null);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [pairAddress, setPairAddress] = useState<string | null>(null);
  const [priceAtoB, setPriceAtoB] = useState<number>(0);

  const isNative = (token: typeof tokenA) => token.isNative;

  const loadBalances = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
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
    } catch (error) {
      console.error("Load balances error:", error);
      setAddress(null);
      setBalanceA("0");
      setBalanceB("0");
    }
  };

  const fetchPairInfo = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const factory = new ethers.Contract(addresses.factory, factoryABI, provider);
      const pairAddr = await factory.getPair(tokenA.address, tokenB.address);

      if (pairAddr === ethers.ZeroAddress) {
        setPairAddress(null);
        setPriceAtoB(0);
        return;
      }

      setPairAddress(pairAddr);
      const pairContract = new ethers.Contract(pairAddr, pairAbi, provider);
      const [reserve0Raw, reserve1Raw] = await pairContract.getReserves();
      const token0 = await pairContract.token0();

      const reserve0 = BigInt(reserve0Raw.toString());
      const reserve1 = BigInt(reserve1Raw.toString());

      if (reserve0 === BigInt(0) || reserve1 === BigInt(0)) {
        setPriceAtoB(0);
        return;
      }

      let price: number = 0;
      if (tokenA.address.toLowerCase() === token0.toLowerCase()) {
        price =
          Number(ethers.formatUnits(reserve1Raw, tokenB.decimals)) /
          Number(ethers.formatUnits(reserve0Raw, tokenA.decimals));
      } else {
        price =
          Number(ethers.formatUnits(reserve0Raw, tokenB.decimals)) /
          Number(ethers.formatUnits(reserve1Raw, tokenA.decimals));
      }

      setPriceAtoB(price);
    } catch (error) {
      console.error("fetchPairInfo error:", error);
      setPairAddress(null);
      setPriceAtoB(0);
    }
  };

  useEffect(() => {
    loadBalances();
    fetchPairInfo();
  }, [tokenA, tokenB]);

  const handleAmountAChange = (val: number) => {
    setAmountA(val);
    if (!pairAddress || priceAtoB === 0) {
      setAmountB(0);
      return;
    }
    setAmountB(val * priceAtoB);
  };

  const handleAmountBChange = (val: number) => {
    setAmountB(val);
  };

  const handleSelectTokenA = (symbol: string) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected || selected.symbol === tokenB.symbol) {
      alert("Token A tidak boleh sama dengan Token B");
      return;
    }
    setTokenA(selected);
    setAmountA(0);
    setAmountB(0);
  };

  const handleSelectTokenB = (symbol: string) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected || selected.symbol === tokenA.symbol) {
      alert("Token B tidak boleh sama dengan Token A");
      return;
    }
    setTokenB(selected);
    setAmountA(0);
    setAmountB(0);
  };

  const addLiquidity = async () => {
    if (!address) return alert("Hubungkan wallet terlebih dahulu.");
    if (amountA <= 0 || amountB <= 0) return alert("Masukkan jumlah token yang valid.");

    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(addresses.Router, routerABI, signer);
      const factory = new ethers.Contract(addresses.factory, factoryABI, signer);

      let pair = await factory.getPair(tokenA.address, tokenB.address);
      if (pair === ethers.ZeroAddress) {
        const tx = await factory.createPair(tokenA.address, tokenB.address);
        await tx.wait();
        pair = await factory.getPair(tokenA.address, tokenB.address);
      }

      const amountADesired = ethers.parseUnits(amountA.toString(), tokenA.decimals);
      const amountBDesired = ethers.parseUnits(amountB.toString(), tokenB.decimals);
      const slippageFactor = BigInt(Math.floor((1 - slippage / 100) * 10000));
      const amountAMin = (amountADesired * slippageFactor) / BigInt(10000);
      const amountBMin = (amountBDesired * slippageFactor) / BigInt(10000);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const isTokenANative = isNative(tokenA);
      const isTokenBNative = isNative(tokenB);

      if (isTokenANative || isTokenBNative) {
        const token = isTokenANative ? tokenB : tokenA;
        const tokenAmount = isTokenANative ? amountBDesired : amountADesired;
        const ethAmount = isTokenANative ? amountADesired : amountBDesired;
        const tokenMin = isTokenANative ? amountBMin : amountAMin;
        const ethMin = isTokenANative ? amountAMin : amountBMin;

        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, addresses.Router);
        if (allowance < tokenAmount) {
          const txApprove = await tokenContract.approve(addresses.Router, tokenAmount);
          await txApprove.wait();
        }

        const tx = await router.addLiquidityETH(
          token.address,
          tokenAmount,
          tokenMin,
          ethMin,
          address,
          deadline,
          {
            value: ethAmount,
          }
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

      alert("Liquidity berhasil ditambahkan!");
      await loadBalances();
    } catch (err) {
      console.error("Add liquidity error:", err);
      alert("Gagal menambahkan liquidity. Cek console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="items-center flex flex-col justify-center">
      <Card className="max-w-[400px] shadow-lg p-5">
        <CardHeader className="flex justify-center items-center gap-2" />
        <div className="w-full mt-4">
          <p className="text-sm mb-1">Token A</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenA.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenA.symbol]}
              onSelectionChange={(keys) => handleSelectTokenA(String(Array.from(keys)[0]))}
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem key={token.symbol} isDisabled={token.symbol === tokenB.symbol}>
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

        <div className="w-full">
          <p className="text-sm mb-1">Token B</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenB.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenB.symbol]}
              onSelectionChange={(keys) => handleSelectTokenB(String(Array.from(keys)[0]))}
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem key={token.symbol} isDisabled={token.symbol === tokenA.symbol}>
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
            Harga 1 {tokenA.symbol} = {priceAtoB.toFixed(6)} {tokenB.symbol}
          </p>
        </div>

        <CardFooter className="mt-4">
          <Button
            isLoading={isLoading}
            disabled={isLoading || amountA <= 0 || amountB <= 0 || tokenA.address === tokenB.address}
            onClick={addLiquidity}
            className="w-full"
          >
            Add Liquidity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
