import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button.jsx';
import { BookOpen } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto shadow-xs">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Page Not Found</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          The publication page or support workspace you requested does not exist or may have moved.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button variant="primary">Return to Portal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
