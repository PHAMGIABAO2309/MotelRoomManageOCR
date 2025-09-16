import { useMemo } from 'react';
import { Room, PageType, UsageRecord } from './types';

const USERS_PER_PAGE = 5;
const INVOICES_PER_PAGE = 10;

// A "selector" is a function that takes state as an argument and returns derived data.
// Here, we're wrapping them in a custom hook for convenience with React's useMemo.
export const useAppSelectors = ({
    rooms,
    users,
    searchQuery,
    userSearchQuery,
    userCurrentPage,
    roomSelectorQuery,
    isLoggedIn,
    currentUser,
    currentPage,
    selectedRoom,
    roomFilterStatus,
    invoiceSearchQuery,
    invoiceFilterRoomId,
    invoiceFilterStatus,
    invoiceSortBy,
    invoiceCurrentPage,
}: any) => {

    const filteredRooms = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        let results = rooms;

        // 1. Filter by status first
        if (roomFilterStatus !== 'all') {
            results = results.filter((room: Room) => room.status === roomFilterStatus);
        }

        // 2. Then filter by search query
        if (query) {
            results = results.filter((room: Room) => {
                const tenant = room.tenant;
                return room.name.toLowerCase().includes(query) || 
                       (tenant && tenant.name.toLowerCase().includes(query)) || 
                       (tenant && tenant.phone.includes(query));
            });
        }

        // 3. Finally, sort by pinned status, preserving the original order within pinned/unpinned groups
        const pinnedResults = results.filter((r: Room) => r.isPinned);
        const unpinnedResults = results.filter((r: Room) => !r.isPinned);

        return [...pinnedResults, ...unpinnedResults];
    }, [rooms, searchQuery, roomFilterStatus]);
    
    const searchSuggestions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        
        if (!query) {
            return rooms.map((room: Room) => ({ type: 'room' as const, room }));
        }

        const roomMatches: { type: 'room', room: Room }[] = [];
        const tenantMatches: { type: 'tenant', room: Room }[] = [];
        
        rooms.forEach((room: Room) => {
            if (room.name.toLowerCase().includes(query)) {
                roomMatches.push({ type: 'room', room });
            }
            if (room.tenant && (room.tenant.name.toLowerCase().includes(query) || room.tenant.phone.includes(query))) {
                if (!roomMatches.some(r => r.room.id === room.id)) {
                    tenantMatches.push({ type: 'tenant', room });
                }
            }
        });
        return [...roomMatches, ...tenantMatches];
    }, [searchQuery, rooms]);

    const filteredUsers = useMemo(() => {
      const query = userSearchQuery.toLowerCase().trim();
      if (!query) return users;
      return users.filter((user: any) => 
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
      );
    }, [users, userSearchQuery]);

    const totalUserPages = useMemo(() => Math.ceil(filteredUsers.length / USERS_PER_PAGE), [filteredUsers]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (userCurrentPage - 1) * USERS_PER_PAGE;
        const endIndex = startIndex + USERS_PER_PAGE;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, userCurrentPage]);
    
    const filteredRoomsForSelector = useMemo(() => {
      const query = roomSelectorQuery.toLowerCase().trim();
      if (!query) return rooms;
      return rooms.filter((room: Room) => room.name.toLowerCase().includes(query));
    }, [rooms, roomSelectorQuery]);

    const allInvoices = useMemo(() => {
      return rooms.flatMap((room: Room) => 
        room.usageHistory.map((record: UsageRecord) => ({
          ...record,
          roomId: room.id,
          roomName: room.name,
        }))
      );
    }, [rooms]);

    const filteredAndSortedInvoices = useMemo(() => {
      let invoices = [...allInvoices];

      if (invoiceSearchQuery.trim()) {
        const lowercasedQuery = invoiceSearchQuery.toLowerCase().trim();
        invoices = invoices.filter(invoice => 
          invoice.roomName.toLowerCase().includes(lowercasedQuery) ||
          invoice.tenantSnapshot.name.toLowerCase().includes(lowercasedQuery)
        );
      }

      if (invoiceFilterRoomId !== 'all') {
        invoices = invoices.filter(invoice => invoice.roomId === invoiceFilterRoomId);
      }

      if (invoiceFilterStatus !== 'all') {
        invoices = invoices.filter(invoice => invoiceFilterStatus === 'paid' ? invoice.isPaid : !invoice.isPaid);
      }

      invoices.sort((a, b) => {
        const dateA = new Date(a.endDate).getTime();
        const dateB = new Date(b.endDate).getTime();
        return invoiceSortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });

      return invoices;
    }, [allInvoices, invoiceSearchQuery, invoiceFilterRoomId, invoiceFilterStatus, invoiceSortBy]);

    const totalInvoicePages = useMemo(() => Math.ceil(filteredAndSortedInvoices.length / INVOICES_PER_PAGE), [filteredAndSortedInvoices]);

    const paginatedInvoices = useMemo(() => {
      const startIndex = (invoiceCurrentPage - 1) * INVOICES_PER_PAGE;
      return filteredAndSortedInvoices.slice(startIndex, startIndex + INVOICES_PER_PAGE);
    }, [filteredAndSortedInvoices, invoiceCurrentPage]);

    const canEdit = useMemo(() => isLoggedIn && currentUser?.role !== 'Tenant', [isLoggedIn, currentUser]);
    const isSubPage = useMemo(() => currentPage === PageType.USER_MANAGEMENT || currentPage === PageType.EDIT_PROFILE || currentPage === PageType.INVOICE_MANAGEMENT, [currentPage]);
    const showFooter = useMemo(() => isLoggedIn && !selectedRoom && !isSubPage && currentPage !== PageType.TENANT_VIEW, [isLoggedIn, selectedRoom, isSubPage, currentPage]);
    const showBeautifulBackground = useMemo(() => isLoggedIn && currentPage === PageType.ROOM_GRID && !selectedRoom, [isLoggedIn, currentPage, selectedRoom]);

    return {
        filteredRooms,
        searchSuggestions,
        filteredUsers,
        totalUserPages,
        paginatedUsers,
        filteredRoomsForSelector,
        allInvoices,
        filteredAndSortedInvoices,
        paginatedInvoices,
        totalInvoicePages,
        canEdit,
        isSubPage,
        showFooter,
        showBeautifulBackground,
    };
};