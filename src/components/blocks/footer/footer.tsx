"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import Image from "next/image";

import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

type FooterProps = React.HTMLAttributes<HTMLElement>;

export const Footer = ({ className, ...props }: FooterProps) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={cn(
      "w-full bg-linear-to-r from-yellow-50 via-pink-50 to-purple-50 border-t border-green-50",
      "relative mt-2",
      className
    )} {...props}>
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full p-3 h-12 w-12 shadow-lg bg-green-600 hover:bg-green-700 text-white animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5 lg:gap-8 xl:gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:pr-8">
            <div className="flex flex-col items-center md:items-start space-y-6">
              <div className="relative group">
                <Image
                  src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267544/off_logo_ggu1ci.png"
                  alt="School Logo"
                  width={140}
                  height={140}
                  className="rounded-lg border-2 border-green-800 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-green-800/5 rounded-lg mix-blend-multiply transition-opacity group-hover:opacity-0" />
              </div>
              <p className="text-lg font-semibold text-green-800 font-serif text-center md:text-left">
                KNOW THYSELF | PURSUIT OF EXCELLENCE
              </p>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, label: "Facebook", href: "#" },
                  { icon: Twitter, label: "Twitter", href: "#" },
                  { icon: Instagram, label: "Instagram", href: "#" },
                  { icon: Linkedin, label: "LinkedIn", href: "#" },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white shadow-xs hover:bg-pink-100 transition-colors duration-200"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5 text-green-600 hover:text-pink-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-green-800 mb-4">Quick Links</h3>
            <nav className="space-y-3">
              {["Home", "About", "Academics", "Contact"].map((item) => (
                <Link
                  key={item}
                  href="/#"
                  className="block text-green-700 transition-all hover:text-pink-600 hover:pl-2 hover:font-medium"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-green-800 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <span className="text-green-700 block"> G.T. Road, Ghakhar Opposite to Model Police station</span>
                  <span className="text-green-700">Ghakhar, 52200, Pakistan</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-600" />
                <Link href="tel:+923001234567" className="text-green-700 hover:text-pink-600">
                  (92) 318 7625415
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600" />
                <Link href="mailto:info@msnschool.edu.pk" className="text-green-700 hover:text-pink-600">
                  info@msns.edu.pk
                </Link>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-green-800 mb-4">Stay Updated</h3>
            <form className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-lg border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-transform hover:scale-[1.02]"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
 
        {/* Divider */}
        <div className="my-4 border-t border-green-100" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between md:flex-row md:space-y-0">
          <p className="text-center text-sm text-green-700 font-medium">
            © {new Date().getFullYear()} MSNS-DEV™ | M.S. NAZ HIGH SCHOOL®
            <br className="md:hidden" /> | All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-sm text-green-700 hover:text-pink-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-green-300">|</span>
            <Link href="#" className="text-sm text-green-700 hover:text-pink-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};