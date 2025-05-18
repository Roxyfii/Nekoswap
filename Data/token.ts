export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint amount) external returns (bool)",
];

export const TOKEN_LIST = [
  {
    symbol: "USDT",
    address: "0xYourUSDTAddressHere",
    decimals: 18,
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  {
    symbol: "DAI",
    address: "0xYourDAIAddressHere",
    decimals: 18,
    logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
  },
];
