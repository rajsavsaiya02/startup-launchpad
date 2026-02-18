import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Search,
  Map,
  FileText,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
      <div
        className="absolute inset-0 bg-grid-slate-200/[0.04] bg-position-[bottom_1px_center] z-0 pointer-events-none"
        style={{ backgroundSize: "40px 40px" }}
      />

      <div className="relative z-10 max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 text-center md:text-left animate-in slide-in-from-left duration-700">
          <div>
            <p className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase mb-2">
              Error 404
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
              Lost in <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Cyberspace?
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto md:mx-0">
              The page you are looking for seems to have drifted away into the
              digital void. Let's get you back on track.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="h-12 px-6 shadow-lg shadow-blue-500/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-500 mb-4">
              Or try searching for it:
            </p>
            <div className="relative max-w-sm mx-auto md:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documentation, pages..."
                className="pl-9 bg-white dark:bg-gray-900/50"
              />
            </div>
          </div>
        </div>

        {/* Right Content - Visual/Links */}
        <div className="hidden md:block bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl rotate-3 hover:rotate-0 transition-transform animate-in slide-in-from-right duration-700 delay-150">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-500" />
            Helpful Destinations
          </h3>

          <div className="space-y-2">
            {[
              {
                icon: FileText,
                label: "Documentation",
                sub: "Guides & Resources",
                path: "/help-center",
              },
              {
                icon: Phone,
                label: "Contact Support",
                sub: "We are here to help",
                path: "/contact",
              },
              {
                icon: Map,
                label: "Sitemap",
                sub: "View all pages",
                path: "/sitemap",
              },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className="flex items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
