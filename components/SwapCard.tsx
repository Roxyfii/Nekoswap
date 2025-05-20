"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardHeader, CardFooter } from "@heroui/card";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { ERC20_ABI, TOKEN_LIST } from "@/Data/token";
import routerABI from "@/Data/routerABI.json";

const ROUTER_ADDRESS = "0xA745B306fBA198b88b57F94A739F05b5043F5d4F";

export default function SwapCard() {
  const [tokenIn, setTokenIn] = useState(TOKEN_LIST[0]);
  const [tokenOut, setTokenOut] = useState(TOKEN_LIST[1]);
  const [amountIn, setAmountIn] = useState<number>(0);
  const [amountOut, setAmountOut] = useState<number>(0);
  const [balanceIn, setBalanceIn] = useState<string>("0");
  const [balanceOut, setBalanceOut] = useState<string>("0");
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isSwapping, setIsSwapping] = useState(false);

  async function getProviderAndSigner() {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  }

  async function loadBalances() {
    try {
      const { provider, signer } = await getProviderAndSigner();
      const address = await signer.getAddress();

      const contractIn = new ethers.Contract(tokenIn.address, ERC20_ABI, provider);
      const contractOut = new ethers.Contract(tokenOut.address, ERC20_ABI, provider);

      const balIn = await contractIn.balanceOf(address);
      const balOut = await contractOut.balanceOf(address);

      setBalanceIn(ethers.formatUnits(balIn, tokenIn.decimals));
      setBalanceOut(ethers.formatUnits(balOut, tokenOut.decimals));
    } catch (e) {
      console.error("Load balances error:", e);
    }
  }

  async function estimateSwap() {
    if (!amountIn || amountIn <= 0) {
      setAmountOut(0);
      return;
    }
    try {
      const { provider } = await getProviderAndSigner();
      const router = new ethers.Contract(ROUTER_ADDRESS, routerABI, provider);

      const amountInParsed = ethers.parseUnits(amountIn.toString(), tokenIn.decimals);
      const path = [tokenIn.address, tokenOut.address];
      const amountsOut = await router.getAmountsOut(amountInParsed, path);
      const amountOutRaw = amountsOut[1];
      const formatted = Number(ethers.formatUnits(amountOutRaw, tokenOut.decimals));
      setAmountOut(formatted);
    } catch (e) {
      console.error("Estimate swap error:", e);
      setAmountOut(0);
    }
  }

  async function checkAndApprove(signer: ethers.Signer, tokenAddress: string, spender: string, amount: bigint) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const owner = await signer.getAddress();
    const allowance = await tokenContract.allowance(owner, spender);
    if (allowance < amount) {
      const txApprove = await tokenContract.approve(spender, ethers.MaxUint256);
      await txApprove.wait();
      console.log("Approved");
    }
  }

  async function doSwap() {
    if (!amountIn || amountIn <= 0) {
      alert("Masukkan jumlah token input");
      return;
    }
    setIsSwapping(true);

    try {
      const { signer } = await getProviderAndSigner();
      const router = new ethers.Contract(ROUTER_ADDRESS, routerABI, signer);

      const amountInParsed = ethers.parseUnits(amountIn.toString(), tokenIn.decimals);
      const amountOutMin = ethers.parseUnits(
        (amountOut * (1 - slippage / 100)).toFixed(tokenOut.decimals),
        tokenOut.decimals
      );
      const path = [tokenIn.address, tokenOut.address];
      const to = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      await checkAndApprove(signer, tokenIn.address, ROUTER_ADDRESS, amountInParsed);

      const tx = await router.swapExactTokensForTokens(
        amountInParsed,
        amountOutMin,
        path,
        to,
        deadline
      );
      await tx.wait();

      alert("Swap berhasil!");
      setAmountIn(0);
      setAmountOut(0);
      loadBalances();
    } catch (e) {
      console.error("Swap gagal:", e);
      alert("Swap gagal, cek console untuk info");
    }
    setIsSwapping(false);
  }

  useEffect(() => {
    loadBalances();
  }, [tokenIn, tokenOut]);

  useEffect(() => {
    estimateSwap();
  }, [amountIn, tokenIn, tokenOut]);

  return (
    <div className="items-center flex flex-col justify-center mt-0">
     
      <Card className="max-w-[400px] shadow-lg shadow-orange-500 justify-center items-center p-5">
        <CardHeader className="flex justify-center items-center gap-2">
          {/* <div className="flex justify-end items-center gap-2">
            <Avatar size="sm" src="/images/avatar.png" />
            <div className="flex flex-col">
              <p className="text-md">HeroUI</p>
              <p className="text-small text-default-500">heroui.com</p>
            </div>
          </div> */}
        </CardHeader>

        <div className="w-full mt-4">
          <p className="text-sm mb-1">From</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenIn.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenIn.symbol]}
              onSelectionChange={(keys) => {
                const symbol = String(Array.from(keys)[0]);
                const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
                if (!selected) return;
                if (selected.symbol === tokenOut.symbol) {
                  alert("Token input tidak boleh sama dengan token output");
                  return;
                }
                setTokenIn(selected);
              }}
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem
                  key={token.symbol}
                  isDisabled={token.symbol === tokenOut.symbol}
                >
                  {token.symbol}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex justify-between items-center mt-2">
            <NumberInput
              aria-label="From Amount"
              value={amountIn}
              onValueChange={(val) => setAmountIn(Number(val) || 0)}
              placeholder="0.0"
              variant="bordered"
              className="w-full"
            />
          </div>
          <p className="text-xs text-right text-default-500 mt-1">
            Balance: {balanceIn}
          </p>
        </div>

        <Divider className="my-4" />

        <div className="w-full">
          <p className="text-sm mb-1">To</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenOut.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenOut.symbol]}
              onSelectionChange={(keys) => {
                const symbol = String(Array.from(keys)[0]);
                const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
                if (!selected) return;
                if (selected.symbol === tokenIn.symbol) {
                  alert("Token output tidak boleh sama dengan token input");
                  return;
                }
                setTokenOut(selected);
              }}
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem
                  key={token.symbol}
                  isDisabled={token.symbol === tokenIn.symbol}
                >
                  {token.symbol}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex justify-between items-center mt-2">
            <NumberInput
              aria-label="To Amount"
              isReadOnly
              value={amountOut}
              placeholder="0.0"
              variant="bordered"
              className="w-full"
            />
          </div>
          <p className="text-xs text-right text-default-500 mt-1">
            Balance: {balanceOut}
          </p>
        </div>

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

        <CardFooter className="mt-6 w-full">
          <Button
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
            onClick={doSwap}
            disabled={isSwapping}
          >
            {isSwapping ? "Swapping..." : "Swap"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
