import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
} from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-screen-xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Shop</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                New Arrivals
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Best Sellers
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Sale
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Collections
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Customer Service</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Shipping & Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Size Guide
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4 md:ml-auto">
          <h2 className="text-lg font-semibold">About Us</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Our Story
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Sustainability
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Press
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
        <div className="mb-4 flex space-x-4 md:mb-0">
          <a
            href="#"
            aria-label="Facebook"
            className="transition-opacity hover:text-opacity-80 focus-visible:outline-none"
          >
            <IconBrandFacebook className="h-6 w-6" />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="transition-opacity hover:text-opacity-80 focus-visible:outline-none"
          >
            <IconBrandInstagram className="h-6 w-6" />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="transition-opacity hover:text-opacity-80 focus-visible:outline-none"
          >
            <IconBrandTwitter className="h-6 w-6" />
          </a>
        </div>
        <div className="text-center text-sm md:text-left">
          © {new Date().getFullYear()} Zircon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
