import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Avatar } from "@heroui/avatar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { TwitterIcon, GithubIcon, DiscordIcon } from "@/components/icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Brand + Main Navigation (Desktop) */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Avatar size="sm" src="/images/logo.png" />
            <h4 className="font-bold ml-1 text-inherit">Nekoswap</h4>
          </NextLink>
         
        </NavbarBrand>

  
    
            <NavbarItem >
            
            </NavbarItem>
            
      </NavbarContent>
      
      {/* Social + Theme + Wallet (Desktop) */}
      <NavbarContent
      
        className="sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className=" sm:flex gap-2">
         
        <div className="text-sm">
      <ConnectButton
        accountStatus="avatar"
        chainStatus="icon"
        showBalance={false}
      />
    </div>
        </NavbarItem>

      </NavbarContent>


  
    </HeroUINavbar>
  );
};
