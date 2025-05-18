"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardHeader, CardFooter } from "@heroui/card";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { ERC20_ABI, TOKEN_LIST } from "@/Data/token";

export default function SwapCard() {
  const [tokenIn, setTokenIn] = useState(TOKEN_LIST[0]);
  const [tokenOut, setTokenOut] = useState(TOKEN_LIST[1]);
  const [amountIn, setAmountIn] = useState<number>(0);
  const [amountOut, setAmountOut] = useState<number>(0);
  const [balanceIn, setBalanceIn] = useState<string>("0");
  const [balanceOut, setBalanceOut] = useState<string>("0");
  const [slippage, setSlippage] = useState<number>(0.5); // default 0.5%

  const loadBalances = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const contractIn = new ethers.Contract(tokenIn.address, ERC20_ABI, provider);
    const contractOut = new ethers.Contract(tokenOut.address, ERC20_ABI, provider);

    const balIn = await contractIn.balanceOf(address);
    const balOut = await contractOut.balanceOf(address);

    setBalanceIn(ethers.formatUnits(balIn, tokenIn.decimals));
    setBalanceOut(ethers.formatUnits(balOut, tokenOut.decimals));
  };

  // Validasi dan set tokenIn, tidak boleh sama dengan tokenOut
  const handleSelectTokenIn = (symbol: string) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected) return;
    if (selected.symbol === tokenOut.symbol) {
      alert("Token input tidak boleh sama dengan token output");
      return;
    }
    setTokenIn(selected);
  };

  // Validasi dan set tokenOut, tidak boleh sama dengan tokenIn
  const handleSelectTokenOut = (symbol: string) => {
    const selected = TOKEN_LIST.find((t) => t.symbol === symbol);
    if (!selected) return;
    if (selected.symbol === tokenIn.symbol) {
      alert("Token output tidak boleh sama dengan token input");
      return;
    }
    setTokenOut(selected);
  };

  useEffect(() => {
    loadBalances();
  }, [tokenIn, tokenOut]);

  return (
    <div className="items-center flex flex-col justify-center mt-0">
      <Card className="max-w-[400px] shadow-lg shadow-orange-500 justify-center items-center p-5">
        <CardHeader className="flex justify-center items-center gap-2">
          <div className="flex justify-end items-center gap-2">
            <Avatar size="sm" src="/images/avatar.png" />
            <div className="flex flex-col">
              <p className="text-md">HeroUI</p>
              <p className="text-small text-default-500">heroui.com</p>
            </div>
          </div>
        </CardHeader>

        {/* From */}
        <div className="w-full mt-4">
          <p className="text-sm mb-1">From</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenIn.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenIn.symbol]}
              onSelectionChange={(keys) => {
                handleSelectTokenIn(String(Array.from(keys)[0]));
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
          <p className="text-xs text-right text-default-500 mt-1">Balance: {balanceIn}</p>
        </div>

        <Divider className="my-4" />

        {/* To */}
        <div className="w-full">
          <p className="text-sm mb-1">To</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenOut.logo} size="sm" />
            <Select
              className="w-full"
              selectedKeys={[tokenOut.symbol]}
              onSelectionChange={(keys) => {
                handleSelectTokenOut(String(Array.from(keys)[0]));
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
          <p className="text-xs text-right text-default-500 mt-1">Balance: {balanceOut}</p>
        </div>

        {/* Slippage Tolerance */}
        <div className="mt-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">Slippage Tolerance (%)</label>
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
          <Button color="primary" className="w-full">
            Swap
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
