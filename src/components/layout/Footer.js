'use client';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border" style={{ backgroundColor: 'var(--footer-background)', color: 'var(--footer-foreground)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center">
          {/* Footer links - stacks on mobile, row on larger screens */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-0 sm:order-2 sm:ml-auto">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          <div className="sm:order-1">
            <p className="text-center sm:text-left text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Habitual. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
