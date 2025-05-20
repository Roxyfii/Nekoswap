"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardHeader, CardFooter } from "@heroui/card";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import pairAbi from "@/Data/pairABI.json"
import addresses from "@/Data/addresses.json";
import factoryABI from "@/Data/factoryABI.json";
import routerABI from "@/Data/routerABI.json";
import { ERC20_ABI, TOKEN_LIST } from "@/Data/token";


useEffect




export default function AddLiquidityCard() {
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState<number>(0);
  const [amountB, setAmountB] = useState<number>(0);
  const [balanceA, setBalanceA] = useState<string>("0");
  const [balanceB, setBalanceB] = useState<string>("0");
  const [address, setAddress] = useState<string | null>(null);
  const [slippage, setSlippage] = useState<number>(0.5); // default 0.5%
  const [isLoading, setIsLoading] = useState(false);

  const loadBalances = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);

      const contractA = new ethers.Contract(tokenA.address, ERC20_ABI, provider);
      const contractB = new ethers.Contract(tokenB.address, ERC20_ABI, provider);

      const balA = await contractA.balanceOf(addr);
      const balB = await contractB.balanceOf(addr);

      setBalanceA(ethers.formatUnits(balA, tokenA.decimals));
      setBalanceB(ethers.formatUnits(balB, tokenB.decimals));
    } catch (error) {
      console.error("Load balances error:", error);
      setAddress(null);
      setBalanceA("0");
      setBalanceB("0");
    }
  };

  const handleSelectTokenA = (symbol: string) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected) return;
    if (selected.symbol === tokenB.symbol) {
      alert("Token A tidak boleh sama dengan Token B");
      return;
    }
    setTokenA(selected);
  };

  const handleSelectTokenB = (symbol: string) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected) return;
    if (selected.symbol === tokenA.symbol) {
      alert("Token B tidak boleh sama dengan Token A");
      return;
    }
    setTokenB(selected);
  };

  useEffect(() => {
    loadBalances();
  }, [tokenA, tokenB]);

  const addLiquidity = async () => {
    if (!address) {
      alert("Silakan hubungkan wallet Anda terlebih dahulu.");
      return;
    }
    if (amountA <= 0 || amountB <= 0) {
      alert("Masukkan jumlah token yang valid.");
      return;
    }

    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factoryContract = new ethers.Contract(addresses.factory, factoryABI, signer);
      const routerContract = new ethers.Contract(addresses.Router, routerABI, signer);

      // Cek pair sudah ada atau belum
      let pairAddress = await factoryContract.getPair(tokenA.address, tokenB.address);
      if (pairAddress === ethers.ZeroAddress) {
        console.log("Pair belum ada, membuat pair baru...");
        const txCreatePair = await factoryContract.createPair(tokenA.address, tokenB.address);
        await txCreatePair.wait();
        pairAddress = await factoryContract.getPair(tokenA.address, tokenB.address);
        console.log("Pair berhasil dibuat:", pairAddress);
      } else {
        console.log("Pair sudah ada:", pairAddress);
      }

      


      const watchPairRead = new ethers.Contract(pairAddress, pairAbi, provider);

      // Ambil data reserve dan token urutan
      const [reserve0, reserve1] = await watchPairRead.getReserves();
      const token0 = await watchPairRead.token0();
      
      let priceAtoB = 0;
      
      if (tokenA.address.toLowerCase() === token0.toLowerCase()) {
        priceAtoB = Number(ethers.formatUnits(reserve1, tokenB.decimals)) / Number(ethers.formatUnits(reserve0, tokenA.decimals));
      } else {
        priceAtoB = Number(ethers.formatUnits(reserve0, tokenB.decimals)) / Number(ethers.formatUnits(reserve1, tokenA.decimals));
      }
      
      alert(`Harga 1 ${tokenA.symbol} ≈ ${priceAtoB.toFixed(6)} ${tokenB.symbol}`);
      
      // Contract token untuk approval
      const tokenAContract = new ethers.Contract(tokenA.address, ERC20_ABI, signer);
      const tokenBContract = new ethers.Contract(tokenB.address, ERC20_ABI, signer);

      const amountADesired = ethers.parseUnits(amountA.toString(), tokenA.decimals);
      const amountBDesired = ethers.parseUnits(amountB.toString(), tokenB.decimals);

      // Hitung minimum amount dengan slippage tolerance
      const slippageFactor = 1 - slippage / 100;
      const amountAMin = (amountADesired * BigInt(Math.floor(slippageFactor * 10000))) / BigInt(10000);
      const amountBMin = (amountBDesired * BigInt(Math.floor(slippageFactor * 10000))) / BigInt(10000);

      // Approval token A dan B jika allowance kurang
      const allowanceA: bigint = await tokenAContract.allowance(address, addresses.Router);
if (allowanceA < amountADesired) {
  const txApproveA = await tokenAContract.approve(addresses.Router, amountADesired);
  await txApproveA.wait();
}

const allowanceB: bigint = await tokenBContract.allowance(address, addresses.Router);
if (allowanceB < amountBDesired) {
  const txApproveB = await tokenBContract.approve(addresses.Router, amountBDesired);
  await txApproveB.wait();
}

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 menit dari sekarang

      // Panggil addLiquidity di Router
      const txAddLiquidity = await routerContract.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        address,
        deadline
      );
      await txAddLiquidity.wait();

      alert("Liquidity berhasil ditambahkan!");
      await loadBalances();

    } catch (error) {
      console.error("addLiquidity error:", error);
      alert("Gagal menambahkan liquidity, cek console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="items-center flex flex-col justify-center">
    
      <Card className="max-w-[400px] shadow-lg shadow-gray-500 justify-center items-center p-5">
        <CardHeader className="flex justify-center items-center gap-2">
          {/* <div className="flex justify-end items-center gap-2">
            <Avatar size="sm" src="/images/avatar.png" />
            <div className="flex flex-col">
              <p className="text-md">Add Liquidity</p>
              <p className="text-small text-default-500">heroui.com</p>
            </div>
          </div> */}
         
        </CardHeader>

        {/* Token A */}
        <div className="w-full mt-4">
          <p className="text-sm mb-1">Token A</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenA.logo} size="sm" />
            <Select
             aria-label="Select token"
              className="w-full"
              selectedKeys={[tokenA.symbol]}
              onSelectionChange={(keys) => {
                handleSelectTokenA(String(Array.from(keys)[0]));
              }}
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
          <div className="flex justify-between items-center mt-2">
            <NumberInput
              aria-label="Amount Token A"
              value={amountA}
              onValueChange={(val) => setAmountA(Number(val) || 0)}
              placeholder="0.0"
              variant="bordered"
              className="w-full"
            />
          </div>
          <p className="text-xs text-right text-default-500 mt-1">
            Balance: {balanceA}
          </p>
        </div>

        <Divider className="my-4" />

        {/* Token B */}
        <div className="w-full">
          <p className="text-sm mb-1">Token B</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenB.logo} size="sm" />
            <Select
             aria-label="Select token"
              className="w-full"
              selectedKeys={[tokenB.symbol]}
              onSelectionChange={(keys) => {
                handleSelectTokenB(String(Array.from(keys)[0]));
              }}
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
          <div className="flex justify-between items-center mt-2">
            <NumberInput
              aria-label="Amount Token B"
              value={amountB}
              onValueChange={(val) => setAmountB(Number(val) || 0)}
              placeholder=""
              variant="bordered"
              className="w-full"
            />
          </div>
          <p className="text-xs text-right text-default-500 mt-1">
            Balance: {balanceB}
          </p>
        </div>

        {/* Slippage Tolerance */}
        <div className="mt-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">
            Slippage Tolerance (%)
          </label>
          <NumberInput
            value={slippage}
            onValueChange={(val) => setSlippage(Number(val) || 0)}
            className="w-full"
            min={0}
            max={50}
            step={0.1}
            variant="bordered"
            placeholder="Enter slippage"
          />
        </div>

        {/* Button Add Liquidity */}
        <CardFooter className="mt-4 flex justify-center">
          <Button className=" bg-orange-500" onClick={addLiquidity} disabled={isLoading}>
            {isLoading ? "Processing..." : "Add Liquidity"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
