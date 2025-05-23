import { ethers } from "ethers";

export type Token = {
  symbol: string;
  address: string;
  logo: string;
};

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export const TOKEN_LIST = [

  {
    symbol: "WPOL",
    address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // placeholder
    decimals: 18,
    logo: "/images/WPOL.png",
    isNative: true,
  },
  {
    symbol: "NEKO",
    address: "0x12fCAF8275b61065839eB859F0d1A7A572767B2B",
    decimals: 18,
    logo: "../images/logo.png",
    isNative: false,
  },
  {
    symbol: "IDRX",
    address: "0x649a2DA7B28E0D54c13D5eFf95d3A660652742cC",
    decimals: 0,
    logo: "../images/IDRX.png",
    isNative: false,
  },
  {
    symbol: "ZGC",
    address: "0x504D546E7637d33D9508b5bd147aDB5F05c3E3Ba",
    decimals: 18,
    logo: "../images/Zerogic.png",
    isNative: false,
  },
  {
    symbol: "USDT",
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    decimals: 18,
    logo: "../images/USDT.png",
    isNative: false,
  },
  {
    symbol: "USDC",
    address: "0x12fCAF8275b61065839eB859F0d1A7A572767B2B",
    decimals: 18,
    logo: "../images/USDC.png",
    isNative: false,
  },
  {
    symbol: "WBTC",
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    decimals: 18,
    logo: "../images/Wbtc.png",
    isNative: false,
  },
  {
    symbol: "WBNB",
    address: "0xecdcb5b88f8e3c15f95c720c51c71c9e2080525d",
    decimals: 18,
    logo: "../images/WBNB.png",
    isNative: false,
  },
  {
    symbol: "WETH",
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    decimals: 18,
    logo: "../images/WETH.png",
    isNative: false,
  },
  {
    symbol: "WSOL",
    address: "0xd93f7e271cb87c23aaa73edc008a79646d1f9912",
    decimals: 18,
    logo: "../images/Solana.png",
    isNative: false,
  },
  {
    symbol: "IDRT",
    address: "0x554cd6bdD03214b10AafA3e0D4D42De0C5D2937b",
    decimals: 18,
    logo: "../images/IDRT.png",
    isNative: false,
  },

];
