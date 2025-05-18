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
import { useWriteContract } from "wagmi";

export default function AddLiquidityCard() {
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState<number>(0);
  const [amountB, setAmountB] = useState<number>(0);
  const [balanceA, setBalanceA] = useState<string>("0");
  const [balanceB, setBalanceB] = useState<string>("0");

  const stakeButton = useWriteContract();

  const loadBalances = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const contractA = new ethers.Contract(tokenA.address, ERC20_ABI, provider);
    const contractB = new ethers.Contract(tokenB.address, ERC20_ABI, provider);

    const balA = await contractA.balanceOf(address);
    const balB = await contractB.balanceOf(address);

    setBalanceA(ethers.formatUnits(balA, tokenA.decimals));
    setBalanceB(ethers.formatUnits(balB, tokenB.decimals));
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

  const addLiquidity = () => {
    // Placeholder fungsi add liquidity,
    // nanti bisa diisi dengan interaksi smart contract
    alert(
      `Add liquidity:\n${amountA} ${tokenA.symbol}\n${amountB} ${tokenB.symbol}`,
    );
  };

  return (
    <div className="items-center flex flex-col justify-center">
      <Card className="max-w-[400px] shadow-lg shadow-green-500 justify-center items-center p-5">
        <CardHeader className="flex justify-center items-center gap-2">
          <div className="flex justify-end items-center gap-2">
            <Avatar size="sm" src="/images/avatar.png" />
            <div className="flex flex-col">
              <p className="text-md">Add Liquidity</p>
              <p className="text-small text-default-500">heroui.com</p>
            </div>
          </div>
        </CardHeader>

        {/* Token A */}
        <div className="w-full mt-4">
          <p className="text-sm mb-1">Token A</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenA.logo} size="sm" />
            <Select
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
              placeholder="0.0"
              variant="bordered"
              className="w-full"
            />
          </div>
          <p className="text-xs text-right text-default-500 mt-1">
            Balance: {balanceB}
          </p>
        </div>

        <CardFooter className="mt-6 w-full">
          <Button color="success" className="w-full" onClick={addLiquidity}>
            Add Liquidity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
