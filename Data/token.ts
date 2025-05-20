import { ethers } from "ethers";
export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export const TOKEN_LIST = [
  {
    symbol: "IDRX",
    address: "0x649a2DA7B28E0D54c13D5eFf95d3A660652742cC",
    decimals: 0,
    logo: "../images/IDRX.png",
  },
  {
    symbol: "MRT",
    address: "0x504D546E7637d33D9508b5bd147aDB5F05c3E3Ba",
    decimals: 18,
    logo: "../images/IDRT.png",
  },
  {
    symbol: "ROXYFI",
    address: "0x12fCAF8275b61065839eB859F0d1A7A572767B2B",
    decimals: 18,
    logo: "../images/logo.png",
  },
];
