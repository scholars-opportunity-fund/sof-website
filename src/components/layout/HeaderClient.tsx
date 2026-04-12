"use client";

import { useState, useCallback, useEffect } from "react";
import Navigation from "./Navigation";

export default function HeaderClient() {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden p-2 text-foreground-muted hover:text-ink"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {/* Desktop navigation */}
      <div className="hidden lg:block">
        <Navigation />
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-overlay"
            onClick={close}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-ink p-6 shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 p-2 text-foreground-on-dark-muted hover:text-foreground-on-dark"
              onClick={close}
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-12">
              <Navigation onNavigate={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
