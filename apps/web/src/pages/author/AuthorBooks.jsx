import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Currency } from '../../components/common/Currency.jsx';
import { EmptyState, Skeleton } from '../../components/common/EmptyState.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  BookOpen,
  Search,
  Filter,
  X,
  ExternalLink,
  Layers,
  Calendar,
  DollarSign,
  Printer
} from 'lucide-react';

export function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getAuthorBooks(params);
      setBooks(res.data || []);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-neutral-900">My Published Titles</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            View distribution channel status, sales figures, and royalty earnings for your catalog.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by title, ISBN, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-700"
          >
            <option value="">All Publication Statuses</option>
            <option value="Published & Live">Published & Live</option>
            <option value="In Production - Cover Design">In Production - Cover Design</option>
            <option value="In Production - Typesetting">In Production - Typesetting</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books found"
          description="No published or production titles matched your current filter criteria."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setStatusFilter(''); fetchBooks(); }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/80 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Title & Genre</th>
                  <th className="px-5 py-3.5">ISBN</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">MRP</th>
                  <th className="px-5 py-3.5 text-right">Copies Sold</th>
                  <th className="px-5 py-3.5 text-right">Earned</th>
                  <th className="px-5 py-3.5 text-right">Paid</th>
                  <th className="px-5 py-3.5 text-right">Pending</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900 font-serif">{b.title}</div>
                      <div className="text-xs text-neutral-500">{b.genre}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-neutral-600">
                      {b.isbn}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        b.status.includes('Published')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium">
                      <Currency value={b.mrp} />
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-medium">
                      {b.total_copies_sold.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-indigo-900">
                      <Currency value={b.total_royalty_earned} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-emerald-700">
                      <Currency value={b.royalty_paid} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-amber-700">
                      <Currency value={b.royalty_pending} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedBook(b)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Detail Drawer Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono text-indigo-900 font-semibold uppercase tracking-wider">
                  {selectedBook.id} • {selectedBook.genre}
                </span>
                <h3 className="text-xl font-bold font-serif text-neutral-900 mt-1">{selectedBook.title}</h3>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <div>
                  <span className="text-xs text-neutral-500 block">Registered ISBN</span>
                  <span className="font-mono text-xs font-bold text-neutral-800">{selectedBook.isbn}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Publication Date</span>
                  <span className="text-xs font-medium text-neutral-800">
                    {selectedBook.publication_date ? new Date(selectedBook.publication_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'In Production'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Retail Price (MRP)</span>
                  <span className="text-xs font-bold text-neutral-800"><Currency value={selectedBook.mrp} /></span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Print Partner</span>
                  <span className="text-xs font-medium text-neutral-800">{selectedBook.print_partner || 'In-House Delhi Hub'}</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Royalty Breakdown (80/20 Net Split)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-lg text-center">
                    <span className="text-[11px] text-indigo-700 block">Total Earned</span>
                    <span className="font-bold text-indigo-950 text-sm"><Currency value={selectedBook.total_royalty_earned} /></span>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-lg text-center">
                    <span className="text-[11px] text-emerald-700 block">Disbursed</span>
                    <span className="font-bold text-emerald-950 text-sm"><Currency value={selectedBook.royalty_paid} /></span>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-lg text-center">
                    <span className="text-[11px] text-amber-700 block">Pending</span>
                    <span className="font-bold text-amber-950 text-sm"><Currency value={selectedBook.royalty_pending} /></span>
                  </div>
                </div>
              </div>

              {/* Live Platforms */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Retail Distribution Channels</h4>
                {selectedBook.available_on && selectedBook.available_on.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedBook.available_on.map((platform) => (
                      <span key={platform} className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200">
                        {platform}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No retail channels live yet (Title is in production).</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedBook(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
