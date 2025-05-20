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
import routerABI from "@/Data/routerABI.json";
import lpTokenABI from "@/Data/pairABI.json"; // Buat file ini dari pair ABI Uniswap V2
const ROUTER_ADDRESS = "0xA745B306fBA198b88b57F94A739F05b5043F5d4F";

export default function RemoveLiquidityCard() {
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [lpTokenAddress, setLpTokenAddress] = useState<string>("");
  const [liquidity, setLiquidity] = useState<number>(0);
  const [balanceLP, setBalanceLP] = useState<string>("0");
  const [removing, setRemoving] = useState(false);

  async function getProviderAndSigner() {
    if (!window.ethereum) throw new Error("No wallet found");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  }

  async function getPairAddress(router: ethers.Contract, tokenA: string, tokenB: string) {
    const factoryAddress = await router.factory();
    const factoryABI = [
      "function getPair(address tokenA, address tokenB) external view returns (address)"
    ];
    const factory = new ethers.Contract(factoryAddress, factoryABI, router.runner);
    return await factory.getPair(tokenA, tokenB);
  }

  async function loadLPBalance() {
    try {
      const { provider, signer } = await getProviderAndSigner();
      const router = new ethers.Contract(ROUTER_ADDRESS, routerABI, provider);
      const pairAddress = await getPairAddress(router, tokenA.address, tokenB.address);
      setLpTokenAddress(pairAddress);

      const pair = new ethers.Contract(pairAddress, lpTokenABI, provider);
      const user = await signer.getAddress();
      const balance = await pair.balanceOf(user);
      setBalanceLP(ethers.formatUnits(balance, 18));
    } catch (e) {
      console.error("Gagal load LP:", e);
    }
  }

  async function approveIfNeeded(signer: ethers.Signer, spender: string, token: string, amount: bigint) {
    const contract = new ethers.Contract(token, ERC20_ABI, signer);
    const owner = await signer.getAddress();
    const allowance = await contract.allowance(owner, spender);
    if (allowance < amount) {
      const tx = await contract.approve(spender, ethers.MaxUint256);
      await tx.wait();
    }
  }

  async function removeLiquidity() {
    if (!liquidity || liquidity <= 0) return;
    setRemoving(true);
    try {
      const { signer } = await getProviderAndSigner();
      const router = new ethers.Contract(ROUTER_ADDRESS, routerABI, signer);
      const amountLP = ethers.parseUnits(liquidity.toString(), 18);
      const deadline = Math.floor(Date.now() / 1000) + 1800;

      await approveIfNeeded(signer, ROUTER_ADDRESS, lpTokenAddress, amountLP);

      const tx = await router.removeLiquidity(
        tokenA.address,
        tokenB.address,
        amountLP,
        0,
        0,
        await signer.getAddress(),
        deadline
      );
      await tx.wait();

      alert("Remove liquidity berhasil");
      setLiquidity(0);
      loadLPBalance();
    } catch (e) {
      console.error("Remove gagal:", e);
      alert("Gagal remove liquidity");
    }
    setRemoving(false);
  }

  useEffect(() => {
    loadLPBalance();
  }, [tokenA, tokenB]);

  return (
    <div className="items-center flex flex-col justify-center mt-0">
      <Card className="max-w-[400px] shadow-lg shadow-orange-500 justify-center items-center p-5">
        <CardHeader className="flex justify-center items-center gap-2" />

        <div className="w-full mt-4">
          <p className="text-sm mb-1">Token A</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenA.logo} size="sm" />
            <Select
             aria-label="Select token"
              className="w-full"
              onSelectionChange={(keys: any) => {
                const selectedSymbol = String(Array.from(keys)[0]);
                const selected = TOKEN_LIST.find((t) => t.symbol === selectedSymbol);
                if (selected && selected.symbol !== tokenB.symbol) {
                  setTokenA(selected);
                }
              }}
              
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem key={token.symbol} isDisabled={token.symbol === tokenB.symbol}>
                  {token.symbol}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="w-full mt-4">
          <p className="text-sm mb-1">Token B</p>
          <div className="flex gap-2 items-center">
            <Avatar src={tokenB.logo} size="sm" />
            <Select
             aria-label="Select token"
              className="w-full"
              selectedKeys={[tokenB.symbol]}
              onSelectionChange={(keys: any) => {
                const selectedSymbol = String(Array.from(keys)[0]);
                const selected = TOKEN_LIST.find((t) => t.symbol === selectedSymbol);
                if (selected && selected.symbol !== tokenA.symbol) {
                  setTokenB(selected);
                }
              }}
              
            >
              {TOKEN_LIST.map((token) => (
                <SelectItem key={token.symbol} isDisabled={token.symbol === tokenA.symbol}>
                  {token.symbol}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <Divider className="my-4" />

        <div className="w-full">
          <p className="text-sm mb-1">LP Amount</p>
          <NumberInput
            aria-label="LP Amount"
            value={liquidity}
            onValueChange={(val) => setLiquidity(Number(val) || 0)}
            placeholder="0.0"
            variant="bordered"
            className="w-full"
          />
          <p className="text-xs text-right text-default-500 mt-1">
            LP Balance: {balanceLP}
          </p>
        </div>

        <CardFooter className="mt-6 w-full">
          <Button
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
            onClick={removeLiquidity}
            disabled={removing}
          >
            {removing ? "Removing..." : "Remove Liquidity"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
