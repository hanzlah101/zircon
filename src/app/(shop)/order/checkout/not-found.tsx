import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { EmptyBagIcon } from "@/components/icons/empty-bag";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16">
      <Card>
        <CardHeader className="items-center justify-center text-center">
          <EmptyBagIcon />
          <CardTitle className="pt-5">Your bag is empty</CardTitle>
          <CardDescription>
            Your bag is empty. Add some items to your bag to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Button asChild className="group">
            <Link href="/p">
              <IconArrowLeft className="mr-2 size-[18px] transition-all duration-300 group-hover:-translate-x-1" />
              Explore latest products
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
