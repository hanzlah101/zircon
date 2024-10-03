import { Suspense } from "react";
import { getFeaturedProducts } from "@/queries/products";
import { Hero, HeroVideo } from "./_components/hero";
import { ProductReelSkeleton } from "./_components/product-reel";
import { Newsletter } from "./_components/newsletter";
import { FeaturedProducts } from "./_components/featured-products";

export default function HomePage() {
  const featuredProductsPromise = getFeaturedProducts();

  return (
    <div className="space-y-12">
      <Hero />

      <div className="mx-auto w-full max-w-screen-xl space-y-4 px-4">
        <h1 className="font-heading text-3xl tracking-tighter md:text-4xl">
          Curated Fragrances
        </h1>
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Suspense
            fallback={
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductReelSkeleton key={i} />
                ))}
              </>
            }
          >
            <FeaturedProducts
              featuredProductsPromise={featuredProductsPromise}
            />
          </Suspense>
        </div>
      </div>

      <HeroVideo />
      <Newsletter />
    </div>
  );
}
