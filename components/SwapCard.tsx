"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardHeader, CardFooter } from "@heroui/card";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import routerABI from "@/Data/routerABI.json";
import { ERC20_ABI, TOKEN_LIST } from "@/Data/token";
import addresses from "@/Data/addresses.json";
import { useAccount } from "wagmi";

export default function SwapCard() {
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState<number>(0);
  const [amountB, setAmountB] = useState<number>(0);
  const [balanceA, setBalanceA] = useState("0");
  const [balanceB, setBalanceB] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  const { address, isConnected } = useAccount();

  const isETH = (token: typeof tokenA) => token.isNative || token.address === ethers.ZeroAddress;

  const loadBalances = async () => {
    if (!window.ethereum || !address) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const getBal = async (token: typeof tokenA) => {
        if (isETH(token)) {
          const bal = await provider.getBalance(address);
          return ethers.formatUnits(bal, 18);
        } else {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
          const bal = await contract.balanceOf(address);
          return ethers.formatUnits(bal, token.decimals);
        }
      };

      setBalanceA(await getBal(tokenA));
      setBalanceB(await getBal(tokenB));
    } catch (e) {
      console.error("Load balance error:", e);
      setBalanceA("0");
      setBalanceB("0");
    }
  };

  const getAmountsOut = async () => {
    if (!window.ethereum || amountA <= 0) return setAmountB(0);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const router = new ethers.Contract(addresses.Router, routerABI, provider);

      const amountIn = ethers.parseUnits(amountA.toString(), tokenA.decimals);
      const path = isETH(tokenA)
        ? [addresses.WETH, tokenB.address]
        : isETH(tokenB)
        ? [tokenA.address, addresses.WETH]
        : [tokenA.address, tokenB.address];

      const amounts = await router.getAmountsOut(amountIn, path);
      const amountOut = ethers.formatUnits(amounts[amounts.length - 1], tokenB.decimals);
      setAmountB(parseFloat(amountOut));
    } catch (err) {
      console.error("getAmountsOut error:", err);
      setAmountB(0);
    }
  };

  const approveIfNeeded = async (
    tokenAddress: string,
    amount: bigint,
    signer: ethers.Signer
  ) => {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const allowance = await token.allowance(address, addresses.Router);
    if (allowance < amount) {
      const tx = await token.approve(addresses.Router, amount);
      await tx.wait();
    }
  };

  const handleSwap = async () => {
    if (!window.ethereum || !address || amountA <= 0) return alert("Masukkan jumlah yang valid");
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(addresses.Router, routerABI, signer);

      const amountIn = ethers.parseUnits(amountA.toString(), tokenA.decimals);
      const amountOutMin = ethers.parseUnits(
        (amountB * (1 - (slippage || 0.5) / 100)).toFixed(tokenB.decimals),
        tokenB.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const path = isETH(tokenA)
        ? [addresses.WETH, tokenB.address]
        : isETH(tokenB)
        ? [tokenA.address, addresses.WETH]
        : [tokenA.address, tokenB.address];

      if (isETH(tokenA)) {
        // ETH -> Token
        await router.swapExactETHForTokens(amountOutMin, path, address, deadline, {
          value: amountIn,
        });
      } else {
        // Token -> Token or Token -> ETH
        await approveIfNeeded(tokenA.address, amountIn, signer);

        if (isETH(tokenB)) {
          await router.swapExactTokensForETH(amountIn, amountOutMin, path, address, deadline);
        } else {
          await router.swapExactTokensForTokens(amountIn, amountOutMin, path, address, deadline);
        }
      }

      alert("Swap berhasil!");
      await loadBalances();
      setAmountA(0);
      setAmountB(0);
    } catch (err) {
      console.error("Swap error:", err);
      alert("Swap gagal. Lihat console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectToken = (isA: boolean, symbol: string) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected || selected.symbol === (isA ? tokenB.symbol : tokenA.symbol)) {
      alert("Token A dan B tidak boleh sama.");
      return;
    }
    if (isA) {
      setTokenA(selected);
      setAmountA(0);
    } else {
      setTokenB(selected);
    }
    setAmountB(0);
  };

  useEffect(() => {
    if (isConnected) loadBalances();
  }, [tokenA, tokenB, address, isConnected]);

  useEffect(() => {
    getAmountsOut();
  }, [amountA, tokenA, tokenB]);

  return (
    <div className="items-center flex flex-col justify-center">
      <Card className="max-w-[400px] shadow-lg p-5">
        <CardHeader className="flex justify-center items-center gap-2" />
        {/* From */}
        <div className="w-full mt-4">
          <p className="text-sm mb-1">From</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenA.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenA.symbol]}
              onSelectionChange={(keys) => handleSelectToken(true, String(Array.from(keys)[0]))}
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
            onValueChange={(val) => {
              if (typeof val === "string") setAmountA(parseFloat(val) || 0);
              else if (typeof val === "number") setAmountA(val);
            }}
            
            placeholder="0.0"
          />
          <p className="text-xs text-gray-600 mt-1">Balance: {balanceA}</p>
        </div>

        <Divider className="my-4" />

        {/* To */}
        <div className="w-full">
          <p className="text-sm mb-1">To (estimated)</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenB.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenB.symbol]}
              onSelectionChange={(keys) => handleSelectToken(false, String(Array.from(keys)[0]))}
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
            isReadOnly
            placeholder="0.0"
          />
          <p className="text-xs text-gray-600 mt-1">Balance: {balanceB}</p>
        </div>

        <Divider className="my-4" />

        {/* Slippage */}
        <div className="w-full">
          <p className="text-sm mb-1">Slippage Tolerance (%)</p>
          <NumberInput
            className="w-full"
            value={slippage}
            min={0}
            max={100}
            step={0.1}
            onValueChange={(val) => {
              if (typeof val === "string") setAmountA(parseFloat(val) || 0);
              else if (typeof val === "number") setAmountA(val);
            }}
            
          />
        </div>

        <CardFooter className="mt-4">
          <Button
            isLoading={isLoading}
            disabled={isLoading || amountA <= 0 || tokenA.symbol === tokenB.symbol}
            onClick={handleSwap}
            className="w-full"
          >
            Swap
          </Button>
        </CardFooter>
      </Card>

      <div className="flex-1 flex justify-center mt-4">
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
