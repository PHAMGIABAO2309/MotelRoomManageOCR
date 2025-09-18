import React from 'react';
// Fix: Import PageType from '../types' instead of '../constants'.
import { LANDLORD_INFO } from '../constants';
import { PageType } from '../types';
// Fix: Corrected icon import path.
import { PlusIcon, LogoutIcon, MagnifyingGlassIcon, XCircleIcon, HomeIcon, CogIcon, UserGroupIcon, UserCircleIcon, ArrowLeftIcon, SunIcon, MoonIcon, PinIcon, ChevronDownIcon, BillIcon, UserIcon, BellIcon, UsersIcon } from './icons';
import SearchInputComponent from './SearchInput';
import NotificationPanel from './NotificationPanel';

const Header: React.FC<{ appLogic: any }> = ({ appLogic }) => {
    const {
        isLoggedIn, currentUser, tenantRoom, searchQuery, isSearchFocused, highlightedIndex, isSettingsOpen,
        isRoomSelectorOpen, roomSelectorQuery, currentPage, selectedRoom,
        theme, isListening, isSearchActiveMobile,
        searchInputRef, searchContainerRef, settingsMenuRef, roomSelectorRef, roomSelectorInputRef, notificationPanelRef,
        isBrowserSupported,
        handleListen, toggleTheme,
        handleNavigateToUserManagement, handleNavigateToInvoiceManagement, handleNavigateToEditProfile, handleNavigateBackToGrid, handleNavigateToTenantArchive,
        handleSuggestionClick, handleSearchKeyDown,
        handleRoomSelect, openSearchMobile, closeSearchMobile,
        filteredRoomsForSelector,
        canEdit, isSubPage,
        setSearchQuery, setHighlightedIndex, setIsSearchFocused,
        setIsSettingsOpen, setRoomSelectorQuery, setIsRoomSelectorOpen, setIsLogoutConfirmOpen,
        handleOpenAddRoomModal,
        // Notification props
        isNotificationPanelOpen, notifications, hasUnreadNotifications, handleToggleNotificationPanel, handleNotificationClick
    } = appLogic;

    const getPageTitle = () => {
        if (!isLoggedIn) {
            return LANDLORD_INFO.name;
        }
        switch (currentPage) {
            case PageType.TENANT_VIEW: return `Xin chào, ${currentUser?.name}`;
            case PageType.USER_MANAGEMENT: return 'Quản Lý Người Dùng';
            case PageType.INVOICE_MANAGEMENT: return 'Quản Lý Hóa Đơn';
            case PageType.TENANT_ARCHIVE: return 'Thông Tin Người Thuê';
            case PageType.EDIT_PROFILE: return 'Chỉnh sửa hồ sơ';
            case PageType.ROOM_GRID:
            default:
                return 'Quản Lý Phòng Trọ';
        }
    };

    return (
        <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg sticky top-0 z-20 h-16">
            <div className="max-w-7xl mx-auto py-3 px-2 sm:px-6 lg:px-8 flex justify-between items-center gap-2 sm:gap-4 h-full relative">
                <div className={`flex items-center flex-1 min-w-0 transition-opacity ${isSearchActiveMobile && isLoggedIn ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {isLoggedIn && isSubPage && canEdit && (
                        <button onClick={handleNavigateBackToGrid} className="p-2 mr-2 -ml-2 sm:mr-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            <ArrowLeftIcon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                        </button>
                    )}
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                        {getPageTitle()}
                    </h1>
                </div>

                <div className={`flex flex-shrink-0 justify-end items-center space-x-1 sm:space-x-2 transition-opacity relative z-10 ${isSearchActiveMobile && isLoggedIn ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {isLoggedIn && canEdit && !isSubPage && (
                        <>
                            <div ref={searchContainerRef} className="relative hidden sm:block max-w-sm">
                                <SearchInputComponent
                                    ref={searchInputRef}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    setHighlightedIndex={setHighlightedIndex}
                                    setIsSearchFocused={setIsSearchFocused}
                                    handleSearchKeyDown={handleSearchKeyDown}
                                    isBrowserSupported={isBrowserSupported}
                                    handleListen={handleListen}
                                    isListening={isListening}
                                    searchSuggestions={appLogic.searchSuggestions}
                                    highlightedIndex={highlightedIndex}
                                    handleSuggestionClick={handleSuggestionClick}
                                    isSearchFocused={isSearchFocused}
                                />
                            </div>

                            <button onClick={openSearchMobile} className="p-2 sm:hidden rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </button>

                            <div ref={roomSelectorRef} className="relative hidden sm:block">
                                <button
                                    onClick={() => setIsRoomSelectorOpen((prev: any) => !prev)}
                                    className="flex-shrink-0 inline-flex items-center justify-center border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors h-9 px-3 py-2"
                                >
                                    <span>Chọn phòng nhanh</span>
                                    <ChevronDownIcon className="w-4 h-4 ml-2 -mr-1" />
                                </button>
                                {isRoomSelectorOpen && (
                                    <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl shadow-2xl bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 z-30 animate-fade-in-up overflow-hidden">
                                        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    ref={roomSelectorInputRef}
                                                    type="text"
                                                    placeholder="Tìm tên phòng..."
                                                    value={roomSelectorQuery}
                                                    onChange={(e) => setRoomSelectorQuery(e.target.value)}
                                                    className="w-full bg-slate-100 dark:bg-slate-700 border-transparent rounded-md py-2 pl-9 pr-3 text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="py-1 max-h-60 overflow-y-auto">
                                            {filteredRoomsForSelector.length > 0 ? (
                                                filteredRoomsForSelector.map((room: any) => (
                                                    <div
                                                        key={room.id}
                                                        onClick={() => handleRoomSelect(room)}
                                                        className="px-4 py-2 text-sm cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 flex items-center transition-colors duration-150 group"
                                                    >
                                                        <span className={`w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 ${room.status === 'occupied' ? 'bg-teal-400 group-hover:bg-white' : 'bg-amber-400 group-hover:bg-white'} transition-colors duration-150`}></span>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="font-medium truncate">{room.name}</p>
                                                            {/* Fix: Changed 'room.tenant' to 'room.tenants' and display joined tenant names. */}
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-indigo-200 truncate transition-colors duration-150">{room.tenants && room.tenants.length > 0 ? room.tenants.map((t: any) => t.name).join(', ') : 'Phòng trống'}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="px-4 py-3 text-sm text-center text-slate-500">Không tìm thấy phòng.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleOpenAddRoomModal} className="hidden sm:inline-flex items-center justify-center bg-indigo-600 text-white rounded-md shadow-sm h-9 px-4 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <PlusIcon className="w-5 h-5" />
                                <span className="ml-2 text-sm font-medium">Thêm Phòng</span>
                            </button>
                        </>
                    )}
                    <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 focus:outline-none transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                    {isLoggedIn && (
                        <>
                          {canEdit && (
                            <div ref={notificationPanelRef} className="relative">
                                <button
                                    onClick={handleToggleNotificationPanel}
                                    className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 focus:outline-none transition-colors relative"
                                    aria-label="Thông báo"
                                >
                                    <BellIcon className="w-6 h-6" />
                                    {hasUnreadNotifications && notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-800">
                                            {notifications.length > 9 ? '9+' : notifications.length}
                                        </span>
                                    )}
                                </button>
                                {isNotificationPanelOpen && (
                                    <NotificationPanel
                                        notifications={notifications}
                                        onNotificationClick={handleNotificationClick}
                                    />
                                )}
                            </div>
                          )}
                          <div ref={settingsMenuRef} className="relative">
                              <button
                                  onClick={() => setIsSettingsOpen((prev: any) => !prev)}
                                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 focus:outline-none transition-colors group relative"
                              >
                                  <div className="absolute -inset-2.5 rounded-full bg-indigo-500/50 blur-lg animate-pulse-glow group-hover:animation-pause"></div>
                                  <CogIcon className="w-6 h-6 animate-spin-slow" />
                              </button>
                              {isSettingsOpen && (
                                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none z-30 animate-fade-in-up">
                                      <div className="py-1">
                                          {canEdit && (
                                              <>
                                                  <button onClick={handleNavigateToInvoiceManagement} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                      <BillIcon className="w-5 h-5 mr-3" />
                                                      Quản lý hóa đơn
                                                  </button>
                                                  <button onClick={handleNavigateToUserManagement} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                      <UserGroupIcon className="w-5 h-5 mr-3" />
                                                      Quản lý người dùng
                                                  </button>
                                                  <button onClick={handleNavigateToTenantArchive} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                      <UsersIcon className="w-5 h-5 mr-3" />
                                                      Thông Tin Người Thuê
                                                  </button>
                                                  <button onClick={handleNavigateToEditProfile} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                      <UserCircleIcon className="w-5 h-5 mr-3" />
                                                      Chỉnh sửa hồ sơ
                                                  </button>
                                              </>
                                          )}
                                          <button onClick={() => setIsLogoutConfirmOpen(true)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                                              <LogoutIcon className="w-5 h-5 mr-3" />
                                              Đăng xuất
                                          </button>
                                      </div>
                                  </div>
                              )}
                          </div>
                        </>
                    )}
                </div>

                {isLoggedIn && isSearchActiveMobile && (
                    <div className="absolute top-0 left-0 w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex flex-col z-30 animate-fade-in-up">
                        <div className="flex-shrink-0 flex items-center gap-2 px-2 h-16 border-b border-slate-200 dark:border-slate-700">
                            <button onClick={closeSearchMobile} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                                <ArrowLeftIcon className="w-6 h-6" />
                            </button>
                            <div className="flex-1">
                                <SearchInputComponent
                                    ref={searchInputRef}
                                    isMobileOverlay={true}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    setHighlightedIndex={setHighlightedIndex}
                                    setIsSearchFocused={setIsSearchFocused}
                                    handleSearchKeyDown={handleSearchKeyDown}
                                    isBrowserSupported={isBrowserSupported}
                                    handleListen={handleListen}
                                    isListening={isListening}
                                    searchSuggestions={appLogic.searchSuggestions}
                                    highlightedIndex={highlightedIndex}
                                    handleSuggestionClick={handleSuggestionClick}
                                    isSearchFocused={isSearchFocused}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2" onMouseDown={(e) => e.preventDefault()}>
                            <div className="py-1 space-y-1">
                                {appLogic.searchSuggestions.length > 0 ? (
                                    appLogic.searchSuggestions.map((item: any, index: number) => (
                                        <div
                                            key={`${item.type}-${item.room.id}`}
                                            onClick={() => handleSuggestionClick(item.room)}
                                            className={`px-4 py-3 text-sm cursor-pointer rounded-lg flex items-center transition-colors duration-150 group ${highlightedIndex === index ? 'bg-indigo-500 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                        >
                                            {item.room.isPinned && <PinIcon className="w-4 h-4 mr-3 text-indigo-400 flex-shrink-0" />}
                                            <div className="flex-1 overflow-hidden">
                                                <p className={`font-semibold ${highlightedIndex === index ? '' : 'text-slate-900 dark:text-white'}`}>{item.room.name}</p>
                                                {/* Fix: Changed 'item.room.tenant' to 'item.room.tenants' and displayed the first tenant's info. */}
                                                {item.room.tenants && item.room.tenants.length > 0 && <p className={`text-xs truncate ${highlightedIndex === index ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{item.room.tenants[0].name} - {item.room.tenants[0].phone}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-400" />
                                        <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                                            {searchQuery ? 'Không tìm thấy kết quả' : 'Tìm kiếm phòng'}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {searchQuery ? `Không có phòng hay người thuê nào khớp với "${searchQuery}".` : 'Tất cả các phòng được hiển thị bên dưới.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-aurora" style={{ backgroundSize: '200% 200%' }} />
        </header>
    );
};

export default Header;