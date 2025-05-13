'use client';

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Habitual. All rights reserved.
          </p>
        </div>
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-gray-500 hover:text-gray-600">
            <span className="sr-only">About</span>
            About
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-600">
            <span className="sr-only">Privacy</span>
            Privacy
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-600">
            <span className="sr-only">Terms</span>
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
