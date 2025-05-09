import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .527-.422.957-.95.957-.528 0-.95-.43-.95-.957l-.002-1.307-2.45-1.05a1 1 0 01-.366-1.643L10.394 2.08zM13.466 7.165l-2.042.87a1 1 0 00-.394 1.652l2.994 2.994a1 1 0 001.414 0l2.994-2.994a1 1 0 00-.394-1.652l-2.042-.87a1 1 0 00-.78 0z" />
            <path d="M13.964 11.4l-3.321 3.32a1 1 0 01-1.414 0l-3.32-3.32a1 1 0 00-1.497 1.32l3.073 5.574a1 1 0 001.497.246l3.073-3.574a1 1 0 000-1.246z" />
          </svg>
          <h1 className="text-2xl font-bold font-heading text-textDark">HomeworkHelper</h1>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/">
            <a className="font-heading font-medium text-primary hover:text-blue-700 transition">Home</a>
          </Link>
          <Link href="/solve">
            <a className="font-heading font-medium text-textDark hover:text-primary transition">My Problems</a>
          </Link>
          <Link href="#">
            <a className="font-heading font-medium text-textDark hover:text-primary transition">Resources</a>
          </Link>
          <Link href="#">
            <a className="font-heading font-medium text-textDark hover:text-primary transition">Help</a>
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button className="hidden md:block" variant="default">Sign In</Button>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <Link href="/">
                  <a className="font-heading font-medium text-lg" onClick={() => setOpen(false)}>Home</a>
                </Link>
                <Link href="/solve">
                  <a className="font-heading font-medium text-lg" onClick={() => setOpen(false)}>My Problems</a>
                </Link>
                <Link href="#">
                  <a className="font-heading font-medium text-lg" onClick={() => setOpen(false)}>Resources</a>
                </Link>
                <Link href="#">
                  <a className="font-heading font-medium text-lg" onClick={() => setOpen(false)}>Help</a>
                </Link>
                <Button className="mt-4 w-full">Sign In</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
