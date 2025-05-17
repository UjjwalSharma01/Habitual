'use client';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border" style={{ backgroundColor: 'var(--footer-background)', color: 'var(--footer-foreground)' }}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-10 md:order-2">
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
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Habitual. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
