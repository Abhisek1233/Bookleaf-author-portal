import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button.jsx';
import { BookOpen } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-200 text-neutral-700 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-neutral-900">Page Not Found</h1>
        <p className="text-sm text-neutral-500">
          The publication page or support workspace you requested does not exist or may have moved.
        </p>
        <Link to="/login" className="inline-block mt-4">
          <Button variant="primary">Return to Portal</Button>
        </Link>
      </div>
    </div>
  );
}
