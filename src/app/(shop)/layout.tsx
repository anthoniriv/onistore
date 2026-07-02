import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileTabBar } from "@/components/mobile-tab-bar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col oni-grain">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileTabBar />
      <WhatsAppFloat />
      <CartDrawer />
    </div>
  );
}
