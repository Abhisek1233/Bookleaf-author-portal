import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Printer,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Store,
  Sparkles
} from 'lucide-react';

const PRODUCTION_STAGES = [
  'Manuscript Received',
  'Editing',
  'Cover Design',
  'Typesetting',
  'Proofreading',
  'ISBN Assignment',
  'Printing',
  'Distribution Setup',
  'Published & Live'
];

export function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
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

  // Helper to determine stage index
  const getStageIndex = (bookStatus) => {
    if (!bookStatus) return 0;
    if (bookStatus.includes('Published')) return 8;
    if (bookStatus.includes('Distribution')) return 7;
    if (bookStatus.includes('Printing')) return 6;
    if (bookStatus.includes('ISBN')) return 5;
    if (bookStatus.includes('Proofreading')) return 4;
    if (bookStatus.includes('Typesetting')) return 3;
    if (bookStatus.includes('Cover Design')) return 2;
    if (bookStatus.includes('Editing')) return 1;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
            Author Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 mt-1">
            My Published Catalog
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Track multi-channel retail distribution, sales performance, and 80/20 net profit earnings.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-neutral-200 rounded-lg p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Gallery Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-indigo-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Data Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
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
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
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

      {/* Books Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No titles match your criteria"
          description="Try broadening your search term or clearing publication status filters."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setStatusFilter(''); fetchBooks(); }}
        />
      ) : viewMode === 'grid' ? (
        /* Visual Book Card / Cover Gallery View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((b) => {
            const isLive = b.status.includes('Published');
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Book Header / Spine Art */}
                <div className={`p-6 ${
                  isLive
                    ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white'
                    : 'bg-gradient-to-br from-amber-950 via-neutral-900 to-amber-900 text-white'
                } relative`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 border border-white/20">
                      {b.id}
                    </span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isLive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-white tracking-tight line-clamp-1 group-hover:text-indigo-200 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">{b.genre}</p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/80 font-mono">
                    <span>ISBN: {b.isbn}</span>
                    <span>{b.mrp ? <Currency value={b.mrp} /> : 'In Production'}</span>
                  </div>
                </div>

                {/* Financial & Performance Snapshot */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Sold</span>
                      <span className="font-bold font-mono text-sm text-neutral-900">{b.total_copies_sold.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Earned</span>
                      <span className="font-bold text-xs text-indigo-950 block mt-0.5"><Currency value={b.total_royalty_earned} /></span>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Pending</span>
                      <span className="font-bold text-xs text-amber-700 block mt-0.5"><Currency value={b.royalty_pending} /></span>
                    </div>
                  </div>

                  {/* Distribution Platforms Pill */}
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Retail Distribution Channels
                    </span>
                    {b.available_on && b.available_on.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {b.available_on.map((p) => (
                          <span key={p} className="text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Pre-launch distribution setup pending.</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedBook(b)}
                    >
                      Production & Royalties
                    </Button>
                    <Link to="/author/tickets/new">
                      <Button variant="ghost" size="sm" title="Raise Query for this Book">
                        <HelpCircle className="w-4 h-4 text-neutral-500" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Title & Genre</th>
                  <th className="px-5 py-3.5">ISBN</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">MRP</th>
                  <th className="px-5 py-3.5 text-right">Copies Sold</th>
                  <th className="px-5 py-3.5 text-right">Earned</th>
                  <th className="px-5 py-3.5 text-right">Pending</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900 font-serif text-sm">{b.title}</div>
                      <div className="text-[11px] text-neutral-500">{b.genre}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-neutral-600">{b.isbn}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        b.status.includes('Published')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium"><Currency value={b.mrp} /></td>
                    <td className="px-5 py-4 text-right font-mono font-medium">{b.total_copies_sold.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-right font-bold text-indigo-950"><Currency value={b.total_royalty_earned} /></td>
                    <td className="px-5 py-4 text-right font-bold text-amber-700"><Currency value={b.royalty_pending} /></td>
                    <td className="px-5 py-4 text-center">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedBook(b)}>
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Inspection Drawer / Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-700 font-bold uppercase tracking-wider">
                  BookLeaf Catalog Entry • ID: {selectedBook.id}
                </span>
                <h2 className="text-2xl font-bold font-serif text-neutral-900 mt-1">{selectedBook.title}</h2>
                <p className="text-xs text-neutral-500">{selectedBook.genre}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 9-Stage Production Lifecycle Visualizer */}
            <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-700" />
                  Publishing Lifecycle Milestone Tracker
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                  Current: {selectedBook.status}
                </span>
              </div>

              {/* Progress bar and dots */}
              <div className="pt-2">
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center">
                  {PRODUCTION_STAGES.map((stage, idx) => {
                    const currentIdx = getStageIndex(selectedBook.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isCompleted
                            ? 'bg-indigo-900 text-white shadow-2xs'
                            : 'bg-neutral-200 text-neutral-500'
                        } ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span className={`text-[9px] mt-1 line-clamp-1 leading-tight ${
                          isCurrent ? 'font-bold text-indigo-950' : 'text-neutral-500'
                        }`}>
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Royalty & Net Profit Breakdown Formula */}
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3 text-xs">
              <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-700" />
                BookLeaf 80/20 Royalty Profit Calculation Policy
              </h3>
              <p className="text-indigo-900/80 text-[11px] leading-relaxed">
                Net Profit per book = MRP minus In-House Printing Cost, Channel Commission (Amazon / Flipkart ~30%), and Shipping Fees. The author receives exactly <strong>80% of net profit</strong> per book sold.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Retail Price (MRP)</span>
                  <span className="font-bold text-neutral-900 text-sm mt-0.5 block"><Currency value={selectedBook.mrp} /></span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Author Share / Copy</span>
                  <span className="font-bold text-indigo-950 text-sm mt-0.5 block"><Currency value={selectedBook.author_royalty_per_copy} /></span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Copies Sold</span>
                  <span className="font-bold text-neutral-900 text-sm mt-0.5 block">{selectedBook.total_copies_sold.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Pending Payout</span>
                  <span className="font-bold text-amber-700 text-sm mt-0.5 block"><Currency value={selectedBook.royalty_pending} /></span>
                </div>
              </div>
            </div>

            {/* Distribution Channels */}
            <div>
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                Live Distribution Retail Partners
              </span>
              {selectedBook.available_on && selectedBook.available_on.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedBook.available_on.map((p) => (
                    <span key={p} className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-neutral-500" />
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">No live channels active yet while in production.</p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <Link to="/author/tickets/new">
                <Button variant="primary" size="sm" icon={HelpCircle}>
                  Raise Support Query About This Book
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={() => setSelectedBook(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
