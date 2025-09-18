import { useMemo } from 'react';
import { Room, PageType, UsageRecord, Tenant } from './types';

const USERS_PER_PAGE = 5;
const INVOICES_PER_PAGE = 10;
const TENANTS_PER_PAGE = 10;

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
    tenantArchiveSearchQuery,
    tenantArchiveCurrentPage,
    tenantArchiveFilterRoomId,
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
            results = results.filter((room: Room) => 
                room.name.toLowerCase().includes(query) ||
                (room.tenants && room.tenants.some(tenant => 
                    tenant.name.toLowerCase().includes(query) || tenant.phone.includes(query)
                ))
            );
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
            if (room.tenants && room.tenants.some(tenant => tenant.name.toLowerCase().includes(query) || tenant.phone.includes(query))) {
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
          (invoice.tenantsSnapshot && invoice.tenantsSnapshot.some(tenant => tenant.name.toLowerCase().includes(lowercasedQuery)))
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
    const isSubPage = useMemo(() => [
        PageType.USER_MANAGEMENT,
        PageType.EDIT_PROFILE,
        PageType.INVOICE_MANAGEMENT,
        PageType.TENANT_ARCHIVE,
    ].includes(currentPage), [currentPage]);
    const showFooter = useMemo(() => isLoggedIn && !selectedRoom && !isSubPage && currentPage !== PageType.TENANT_VIEW, [isLoggedIn, selectedRoom, isSubPage, currentPage]);
    const showBeautifulBackground = useMemo(() => isLoggedIn && currentPage === PageType.ROOM_GRID && !selectedRoom, [isLoggedIn, currentPage, selectedRoom]);
    
    // --- Selectors for Tenant Archive ---
    const allTenants = useMemo(() => {
        // Map<tenantId, { tenant: Tenant, room: {id: string, name: string}, isCurrent: boolean, lastSeenDate: string }>
        const tenantDataMap = new Map<string, { tenant: Tenant; room: { id: string; name: string }; isCurrent: boolean; lastSeenDate: string }>();

        const updateTenantData = (tenant: Tenant, room: Room, isCurrent: boolean, date: string) => {
            if (!tenant || !tenant.id) return;
            const existing = tenantDataMap.get(tenant.id);

            if (!existing || (isCurrent && !existing.isCurrent) || (isCurrent === existing.isCurrent && new Date(date) > new Date(existing.lastSeenDate))) {
                tenantDataMap.set(tenant.id, { tenant, room: { id: room.id, name: room.name }, isCurrent, lastSeenDate: date });
            }
        };

        for (const room of rooms) {
            // Process current tenants: they have highest priority
            for (const tenant of room.tenants) {
                updateTenantData(tenant, room, true, new Date().toISOString());
            }
            // Process historical tenants from all histories, sorted by date
            const fullHistory = [...(room.usageHistory || []), ...(room.archivedUsageHistory || [])]
                .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
            
            for (const record of fullHistory) {
                for (const tenant of record.tenantsSnapshot) {
                    updateTenantData(tenant, room, false, record.endDate);
                }
            }
        }

        const tenantsWithRooms = Array.from(tenantDataMap.values()).map(data => ({
            ...data.tenant,
            roomName: data.room.name,
            roomId: data.room.id,
        }));

        return tenantsWithRooms.sort((a, b) => a.name.localeCompare(b.name));
    }, [rooms]);

    const tenantsForArchiveList = useMemo(() => {
        if (tenantArchiveFilterRoomId === 'all') {
            return allTenants;
        }
        return allTenants.filter((tenant: any) => tenant.roomId === tenantArchiveFilterRoomId);
    }, [tenantArchiveFilterRoomId, allTenants]);
    
    const filteredTenants = useMemo(() => {
      const query = tenantArchiveSearchQuery.toLowerCase().trim();
      if (!query) return tenantsForArchiveList;
      return tenantsForArchiveList.filter((tenant: Tenant) =>
          tenant.name.toLowerCase().includes(query) ||
          tenant.phone.includes(query) ||
          (tenant.idNumber && tenant.idNumber.includes(query))
      );
    }, [tenantsForArchiveList, tenantArchiveSearchQuery]);

    const totalTenantPages = useMemo(() => Math.ceil(filteredTenants.length / TENANTS_PER_PAGE), [filteredTenants]);

    const paginatedTenants = useMemo(() => {
        const startIndex = (tenantArchiveCurrentPage - 1) * TENANTS_PER_PAGE;
        return filteredTenants.slice(startIndex, startIndex + TENANTS_PER_PAGE);
    }, [filteredTenants, tenantArchiveCurrentPage]);

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
        allTenants,
        filteredTenants,
        totalTenantPages,
        paginatedTenants,
    };
};