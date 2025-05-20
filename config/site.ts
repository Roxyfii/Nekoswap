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
      label: "",
      href: "/", // Ganti dari "#" menjadi route valid
    },
    {
      label: "Swap",
      href: "/addliquidity",
    },
    {
      label: "",
      href: "/",
    },
    {
      label: "Earn",
      href: "/docs",
    },
    {
      label: "NFT",
      href: "/",
    },
    {
      label: "Whitepaper",
      href: "/",
    },
    {
      label: "Docs",
      href: "/",
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
