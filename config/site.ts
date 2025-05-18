export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Nekoswap",
  description: "(AMM) AUTO MARKET MAKER.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Swap",
      href: "/docs",
    },
    {
      label: "Addliquidity",
      href: "/addliquidity",
    },
    {
      label: "Farms",
      href: "/blog",
    },
    {
      label: "Pools",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Swap",
      href: "/swap", // Ganti dari "#" menjadi route valid
    },
    {
      label: "Add Liquidity",
      href: "/addliquidity",
    },
    {
      label: "Farms",
      href: "/projects",
    },
    {
      label: "Pools",
      href: "/docs",
    },
    {
      label: "NFT",
      href: "/calendar",
    },
    {
      label: "Whitepaper",
      href: "/settings",
    },
    {
      label: "Docs",
      href: "/help-feedback",
      
    },
    {
      label: "Launchpad",
      href: "/", // jika ini memang home
    },
  ],
  links: {
    github: "",
    twitter: "",
    docs: "",
    discord: "",
    sponsor: "",
  },
};
