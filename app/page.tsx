
import BottomNavbar from "@/components/BottomNavbar";
import HeroSection from "@/components/HeroSection";
import UserStatsSection from "@/components/UserStatsSections";
export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block text-center justify-center">
        <HeroSection/>
        <UserStatsSection/>
     </div>
    </section>
  );
}
