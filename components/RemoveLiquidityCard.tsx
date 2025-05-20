"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardHeader, CardFooter } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { ERC20_ABI, TOKEN_LIST } from "@/Data/token";
import routerABI from "@/Data/routerABI.json";
import lpTokenABI from "@/Data/pairABI.json";

const ROUTER_ADDRESS = "0xA745B306fBA198b88b57F94A739F05b5043F5d4F";

export default function RemoveLiquidityCard() {
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [lpTokenAddress, setLpTokenAddress] = useState<string>("");
  const [liquidity, setLiquidity] = useState<string>("");
  const [balanceLP, setBalanceLP] = useState<string>("0");
  const [removing, setRemoving] = useState(false);
  const [connected, setConnected] = useState(false);

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
      if (!pairAddress || pairAddress === ethers.ZeroAddress) {
        setLpTokenAddress("");
        setBalanceLP("0");
        setConnected(true); // Wallet connected, tapi LP token belum ada
        return;
      }
      setLpTokenAddress(pairAddress);

      const pair = new ethers.Contract(pairAddress, lpTokenABI, provider);
      const user = await signer.getAddress();
      const balance = await pair.balanceOf(user);
      setBalanceLP(ethers.formatUnits(balance, 18));
      setConnected(true);
    } catch (e) {
      console.error("Gagal load LP:", e);
      setBalanceLP("0");
      setConnected(false);
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

  async function getBlockchainTimestamp(provider: ethers.Provider) {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    if (!block) throw new Error("Block not found");
    return block.timestamp;
  }

  async function removeLiquidity() {
    if (!liquidity || Number(liquidity) <= 0) {
      alert("Isi jumlah LP token yang ingin di-remove");
      return;
    }
    if (!lpTokenAddress || lpTokenAddress === ethers.ZeroAddress) {
      alert("Alamat LP token belum tersedia atau tidak valid");
      return;
    }
    setRemoving(true);
    try {
      const { provider, signer } = await getProviderAndSigner();
      const router = new ethers.Contract(ROUTER_ADDRESS, routerABI, signer);

      const blockTimestamp = await getBlockchainTimestamp(provider);
      const deadline = blockTimestamp + 3600; // 1 jam dari waktu block terbaru

      const amountLP = ethers.parseUnits(liquidity.toString(), 18);

      await approveIfNeeded(signer, ROUTER_ADDRESS, lpTokenAddress, amountLP);

      const tx = await router.removeLiquidity(
        tokenA.address,
        tokenB.address,
        amountLP,
        0, // amountAMin
        0, // amountBMin
        await signer.getAddress(),
        deadline
      );

      await tx.wait();

      alert("Remove liquidity berhasil!");
      setLiquidity("");
      await loadLPBalance();
    } catch (e: any) {
      console.error("Remove liquidity error:", e);
      if (e?.reason) alert(`Gagal remove liquidity: ${e.reason}`);
      else if (e?.message) alert(`Gagal remove liquidity: ${e.message}`);
      else alert("Gagal remove liquidity: Unknown error");
    }
    setRemoving(false);
  }

  useEffect(() => {
    loadLPBalance();
  }, [tokenA, tokenB]);

  return (
    <div className="items-center flex flex-col justify-center mt-0">
      <Card className="max-w-[400px] shadow-lg shadow-orange-500 justify-center items-center p-5">
        <CardHeader className="flex justify-center items-center gap-2">
          <h3 className="text-lg font-semibold">Remove Liquidity</h3>
        </CardHeader>

        {!connected ? (
          <p className="text-center text-red-500 mt-4">Wallet not connected or failed to load.</p>
        ) : (
          <>
            <div className="w-full mt-4">
              <p className="text-sm mb-1">Token A</p>
              <div className="flex gap-2 items-center">
                <Avatar src={tokenA.logo} size="sm" />
                <Select
                  className="w-full"
                  selectedKeys={[tokenA.symbol]}
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
              <Input
                aria-label="LP Amount"
                type="text"
                value={liquidity}
                onChange={(e) => setLiquidity(e.target.value)}
                placeholder="0.0"
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
          </>
        )}
      </Card>
    </div>
  );
}
