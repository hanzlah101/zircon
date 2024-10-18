import { validateRequest } from "@/lib/auth/validate-request";
import { Announcement } from "./_components/announcement";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

import { AuthModal } from "./_components/auth/auth-modal";
import { BagModal } from "./_components/bag-modal";
import { TrackOrderModal } from "./_components/track-order-modal";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  return (
    <>
      <AuthModal user={user} />
      <BagModal />
      <TrackOrderModal />
      <div>
        <Announcement />
        <Header user={user} />
        {children}
        <Footer />
      </div>
    </>
  );
}
