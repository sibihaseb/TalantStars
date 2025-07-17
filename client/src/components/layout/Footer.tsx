import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/PNG FILE 9_1752757531948.png";

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <img src={logoPath} alt="Talents & Stars" className="h-8 w-auto" />
            </div>
            <p className="text-gray-300 mb-6">
              The AI-powered platform connecting entertainment professionals with their next opportunity.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Talents</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-white transition-colors">
                  Upload Portfolio
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Find Opportunities
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Producers</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Search Talent
                </Link>
              </li>
              <li>
                <Link href="/jobs/new" className="hover:text-white transition-colors">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Manage Projects
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Talents & Stars. All rights reserved. Built with AI-powered technology.</p>
        </div>
      </div>
    </footer>
  );
}
