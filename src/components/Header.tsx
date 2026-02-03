import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, User, Package, Layers, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useSiteContent } from '@/context/SiteContentContext';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

type NavLink =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never };

const NAV_LINKS: NavLink[] = [
  { label: 'New Arrivals', href: '#' },
  { label: 'Products', to: '/products' },
  { label: 'Profile', to: '/profile' },
];

function getNavIcon(label: string, size: 'sm' | 'md') {
  const className = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  if (label === 'Products') return <Layers className={className} />;
  if (label === 'Profile') return <UserCircle className={className} />;
  return null;
}

function isRouterLink(link: NavLink): link is NavLink & { to: string } {
  return 'to' in link && typeof link.to === 'string';
}

function getInitials(name: string, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) return email.slice(0, 2).toUpperCase();
  return 'U';
}

const Header = ({ cartCount, onCartClick }: HeaderProps) => {
  const { banner } = useSiteContent();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm">
        {banner.text}
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((link) =>
                  isRouterLink(link) ? (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {getNavIcon(link.label, 'md')}
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  )
                )}
                <Link
                  to="/orders"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  My Orders
                </Link>
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-muted-foreground pt-2 border-t border-border mt-2">
                      {user?.name ?? user?.email}
                    </span>
                    <Button
                      variant="ghost"
                      className="text-lg font-medium text-foreground hover:text-destructive justify-start gap-2"
                      onClick={logout}
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <User className="h-5 w-5" />
                    Login
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex-1 md:flex-none">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>
                HFD
              </span>
              <span className="text-lg md:text-xl text-foreground hidden sm:inline" style={{ fontFamily: 'Playfair Display, serif' }}>
                High Fashion Design
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              isRouterLink(link) ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group flex items-center gap-1.5"
                >
                  {getNavIcon(link.label, 'sm')}
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              )
            )}
            <Link
              to="/orders"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group flex items-center gap-1.5"
            >
              <Package className="h-4 w-4" />
              My Orders
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                Login
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            )}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0 h-9 w-9">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/15 text-primary text-sm font-medium">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <UserCircle className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/auth" title="Login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary text-secondary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
