import React from 'react';
import { MagnifyingGlassIcon, XCircleIcon, MicrophoneIcon, HomeIcon, UserIcon } from './icons';
import { Room } from '../types';

interface SearchInputComponentProps {
  isMobileOverlay?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setHighlightedIndex: (index: number) => void;
  setIsSearchFocused: (isFocused: boolean) => void;
  handleSearchKeyDown: (e: React.KeyboardEvent) => void;
  isBrowserSupported: boolean;
  handleListen: () => void;
  isListening: boolean;
  searchSuggestions: { type: 'room' | 'tenant'; room: Room }[];
  highlightedIndex: number;
  handleSuggestionClick: (room: Room) => void;
  isSearchFocused: boolean;
}

export const SearchInputComponent = React.forwardRef<HTMLInputElement, SearchInputComponentProps>(
  ({
    isMobileOverlay = false,
    searchQuery,
    setSearchQuery,
    setHighlightedIndex,
    setIsSearchFocused,
    handleSearchKeyDown,
    isBrowserSupported,
    handleListen,
    isListening,
    searchSuggestions,
    highlightedIndex,
    handleSuggestionClick,
    isSearchFocused
  }, ref) => {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </div>
        <input 
          ref={ref} 
          type="text" 
          placeholder="Tìm theo phòng, tên, SĐT..." 
          value={searchQuery} 
          onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(-1); }} 
          onFocus={() => setIsSearchFocused(true)} 
          onKeyDown={handleSearchKeyDown} 
          className="w-full bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-full py-2 pl-11 pr-10 text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {!searchQuery ? (
             isBrowserSupported && (
               <button type="button" onClick={handleListen} className={`transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <MicrophoneIcon className="w-5 h-5"/>
               </button>
             )
        ) : (
          <button type="button" onClick={() => { setSearchQuery(''); setHighlightedIndex(-1); (ref as React.RefObject<HTMLInputElement>)?.current?.focus(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {!isMobileOverlay && isSearchFocused && searchSuggestions.length > 0 && (
          <div className="absolute mt-2 w-full rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 z-30 animate-fade-in-up">
              <div className="py-1 max-h-60 overflow-auto">
                  {searchSuggestions.map((item, index) => (
                      <div key={`${item.type}-${item.room.id}`} onClick={() => handleSuggestionClick(item.room)} className={`px-4 py-2 text-sm cursor-pointer ${highlightedIndex === index ? 'bg-indigo-500 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                          <div className="flex items-center">
                              {item.type === 'room' ? <HomeIcon className="w-4 h-4 mr-2"/> : <UserIcon className="w-4 h-4 mr-2"/>}
                              <div className="flex-1">
                                  <p className={highlightedIndex === index ? 'font-semibold' : 'font-medium'}>{item.room.name}</p>
                                  {/* Fix: Changed 'item.room.tenant' to 'item.room.tenants' and displayed the first tenant's info. */}
                                  {item.room.tenants && item.room.tenants.length > 0 && <p className={`text-xs ${highlightedIndex === index ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{item.room.tenants[0].name} - {item.room.tenants[0].phone}</p>}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
    );
  }
);

export default SearchInputComponent;