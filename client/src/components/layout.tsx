import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe, Heart } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
  { name: "Impact", href: "/impact" },
  { name: "Partners", href: "/partners" },
  { name: "Get Involved", href: "/get-involved" },
  { name: "About", href: "/about" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AODI</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  size="sm"
                  data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:gap-2">
            <Link href="/get-involved">
              <Button data-testid="button-donate">
                <Heart className="mr-2 h-4 w-4" />
                Support Us
              </Button>
            </Link>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 pt-8">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      data-testid={`mobile-nav-${item.name.toLowerCase().replace(" ", "-")}`}
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
                <Link href="/get-involved" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full mt-4" data-testid="mobile-button-donate">
                    <Heart className="mr-2 h-4 w-4" />
                    Support Us
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-bold">AODI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Africa of Our Dream Initiative. UK-based, Africa-focused.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/programs" className="hover:text-primary">Programs</Link></li>
                <li><Link href="/impact" className="hover:text-primary">Impact</Link></li>
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get Involved</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/get-involved" className="hover:text-primary">Become a Mentor</Link></li>
                <li><Link href="/get-involved" className="hover:text-primary">Partner With Us</Link></li>
                <li><Link href="/get-involved" className="hover:text-primary">Volunteer</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>United Kingdom</li>
                <li>info@aodi.org</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Africa of Our Dream Initiative. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
