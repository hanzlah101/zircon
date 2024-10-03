import { validateRequest } from "@/lib/auth/validate-request";
import { AuthModal } from "./_components/auth/auth-modal";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { BagModal } from "./_components/bag-modal";

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
      <Header />
      <div className="mt-20">{children}</div>
      <Footer />
    </>
  );
}
