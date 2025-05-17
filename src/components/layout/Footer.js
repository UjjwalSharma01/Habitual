'use client';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-footer-background text-footer-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center">
          {/* Footer links - stacks on mobile, row on larger screens */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-0 sm:order-2 sm:ml-auto">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
          <div className="sm:order-1 flex items-center">
            <p className="text-center sm:text-left text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Habitual</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
