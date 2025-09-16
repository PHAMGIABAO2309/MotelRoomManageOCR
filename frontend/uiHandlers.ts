import { useMemo } from 'react';
import { PageType, ModalType, Room } from './types';
import { ELECTRIC_RATE, WATER_RATE } from './constants';

declare const XLSX: any;

export const createUIHandlers = ({
    rooms,
    setActiveModal,
    setRecordToEdit,
    setTenantToShow,
    setUserToEdit,
    setSuggestedRoomInfo,
    setInvoiceToView,
    setCurrentPage,
    setSelectedRoom,
    setIsSettingsOpen,
    setIsSearchActiveMobile,
    searchInputRef,
    setSearchQuery,
    setHighlightedIndex,
    highlightedIndex,
    setIsSearchFocused,
    setTheme,
    theme,
    setIsListening,
    isListening,
    recognitionRef,
    setUserCurrentPage,
    userCurrentPage,
    setIsRoomSelectorOpen,
    setRoomSelectorQuery,
    isSearchActiveMobile,
    roomSelectorInputRef,
    setRoomFilterStatus,
    setInvoiceCurrentPage,
    invoiceCurrentPage,
    invoiceFilterRoomId,
    setInvoiceToDelete,
}: any, selectors: any) => {

    const { searchSuggestions, totalUserPages, totalInvoicePages } = selectors;

    const isBrowserSupported = useMemo(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition), []);

    const handleListen = () => {
        const recognition = recognitionRef.current;
        if (!recognition || isListening) return;

        try {
            recognition.start();
            setIsListening(true);
        } catch (e) {
            console.error("Could not start recognition:", e);
        }
    };

    const openSearchMobile = () => {
        setIsSearchActiveMobile(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
    };

    const closeSearchMobile = () => {
        setIsSearchActiveMobile(false);
        setSearchQuery('');
        searchInputRef.current?.blur();
    };

    const toggleTheme = () => {
        setTheme((prevTheme: string) => prevTheme === 'light' ? 'dark' : 'light');
    };

    const openModal = (type: ModalType) => setActiveModal(type);
    const closeModal = () => {
        setActiveModal(ModalType.NONE);
        setRecordToEdit(null);
        setTenantToShow(null);
        setUserToEdit(null);
    };

    const handleOpenInvoiceModal = (room: any, record: any) => setInvoiceToView({ room, record });
    const handleCloseInvoiceModal = () => setInvoiceToView(null);

    const handleOpenAddRoomModal = () => {
        let nextRoomName = 'Phòng 101';
        let lastRent: number | undefined = undefined;
        if (rooms.length > 0) {
            const roomNumbers = rooms.map((r: any) => parseInt(r.name.match(/\d+$/)?.[0] || '0')).filter((n: number) => n > 0);
            if (roomNumbers.length > 0) nextRoomName = `Phòng ${Math.max(...roomNumbers) + 1}`;
            lastRent = rooms[rooms.length - 1].baseRent;
        }
        setSuggestedRoomInfo({ name: nextRoomName, rent: lastRent });
        openModal(ModalType.ADD_ROOM);
    };

    const handleOpenEditUsageModal = (record: any) => {
        setRecordToEdit(record);
        openModal(ModalType.EDIT_USAGE);
    };
    
    const handleOpenCheckoutModal = () => {
        openModal(ModalType.CHECK_OUT);
    };

    const handleOpenTenantDetailModal = (tenant: any) => {
        setTenantToShow(tenant);
        openModal(ModalType.TENANT_DETAIL);
    };

    const handleOpenAddUserModal = () => {
        setUserToEdit(null);
        openModal(ModalType.ADD_USER);
    };

    const handleOpenEditUserModal = (user: any) => {
        setUserToEdit(user);
        openModal(ModalType.EDIT_USER);
    };

    const handleNavigateToUserManagement = () => {
        setCurrentPage(PageType.USER_MANAGEMENT);
        setSelectedRoom(null);
        setIsSettingsOpen(false);
    };
    
    const handleNavigateToInvoiceManagement = () => {
        setCurrentPage(PageType.INVOICE_MANAGEMENT);
        setSelectedRoom(null);
        setIsSettingsOpen(false);
    };

    const handleNavigateToEditProfile = () => {
        setCurrentPage(PageType.EDIT_PROFILE);
        setSelectedRoom(null);
        setIsSettingsOpen(false);
    };
    
    const handleNavigateBackToGrid = () => {
        setCurrentPage(PageType.ROOM_GRID);
    };

    const handleSuggestionClick = (room: any) => {
        setSelectedRoom(room);
        setSearchQuery('');
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
        if (isSearchActiveMobile) {
            closeSearchMobile();
        }
    };
    
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (searchSuggestions.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex((prev: number) => (prev + 1) % searchSuggestions.length); } 
        else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((prev: number) => (prev - 1 + searchSuggestions.length) % searchSuggestions.length); } 
        else if (e.key === 'Enter') { if (highlightedIndex >= 0) { e.preventDefault(); handleSuggestionClick(searchSuggestions[highlightedIndex].room); } } 
        else if (e.key === 'Escape') { setIsSearchFocused(false); setHighlightedIndex(-1); searchInputRef.current?.blur(); }
    };

    const handleUserPageChange = (direction: 'next' | 'prev') => {
        if (direction === 'next' && userCurrentPage < totalUserPages) {
            setUserCurrentPage((prev: number) => prev + 1);
        } else if (direction === 'prev' && userCurrentPage > 1) {
            setUserCurrentPage((prev: number) => prev - 1);
        }
    };

    const handleInvoicePageChange = (direction: 'next' | 'prev') => {
        if (direction === 'next' && invoiceCurrentPage < totalInvoicePages) {
            setInvoiceCurrentPage((prev: number) => prev + 1);
        } else if (direction === 'prev' && invoiceCurrentPage > 1) {
            setInvoiceCurrentPage((prev: number) => prev - 1);
        }
    };
    
    const handleRoomSelect = (room: any) => {
        setSelectedRoom(room);
        setIsRoomSelectorOpen(false);
        setRoomSelectorQuery('');
    };

    const handleSetRoomFilter = (status: 'all' | 'occupied' | 'vacant') => {
        setRoomFilterStatus(status);
        setCurrentPage(PageType.ROOM_GRID);
        setSelectedRoom(null);
    };

    const handleExportInvoicesToExcel = () => {
        if (invoiceFilterRoomId === 'all') {
            alert("Vui lòng chọn một phòng cụ thể để xuất hóa đơn.");
            return;
        }
        if (typeof XLSX === 'undefined') {
            console.error("XLSX library not loaded!");
            alert("Lỗi: Không thể xuất excel. Vui lòng làm mới trang và thử lại.");
            return;
        }

        const roomToExport = rooms.find((r: Room) => r.id === invoiceFilterRoomId);
        if (!roomToExport) return;

        const sortedHistory = [...roomToExport.usageHistory].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        if (sortedHistory.length === 0) {
            alert(`Phòng ${roomToExport.name} không có hóa đơn nào để xuất.`);
            return;
        }

        const dataForSheet = sortedHistory.map((record, index) => {
            const prevRecord = index > 0 ? sortedHistory[index - 1] : null;
            return {
                "Kỳ Thanh Toán": `${new Date(record.startDate).toLocaleDateString('vi-VN')} - ${new Date(record.endDate).toLocaleDateString('vi-VN')}`,
                "Tên Người Thuê": record.tenantSnapshot.name,
                "CS Điện Cũ": prevRecord ? prevRecord.electricReading : 0,
                "CS Điện Mới": record.electricReading,
                "Sử Dụng Điện (kWh)": record.electricUsage,
                "CS Nước Cũ": prevRecord ? prevRecord.waterReading : 0,
                "CS Nước Mới": record.waterReading,
                "Sử Dụng Nước (m³)": record.waterUsage,
                "Tiền Phòng (VND)": roomToExport.baseRent,
                "Tiền Điện (VND)": record.electricUsage * ELECTRIC_RATE,
                "Tiền Nước (VND)": record.waterUsage * WATER_RATE,
                "Tổng Tiền (VND)": record.billAmount,
                "Trạng Thái": record.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataForSheet);
        ws['!cols'] = [
            { wch: 22 }, // Kỳ Thanh Toán
            { wch: 20 }, // Tên Người Thuê
            { wch: 12 }, // CS Điện Cũ
            { wch: 12 }, // CS Điện Mới
            { wch: 20 }, // Sử Dụng Điện (kWh)
            { wch: 12 }, // CS Nước Cũ
            { wch: 12 }, // CS Nước Mới
            { wch: 20 }, // Sử Dụng Nước (m³)
            { wch: 15 }, // Tiền Phòng (VND)
            { wch: 15 }, // Tiền Điện (VND)
            { wch: 15 }, // Tiền Nước (VND)
            { wch: 15 }, // Tổng Tiền (VND)
            { wch: 15 }, // Trạng Thái
        ];
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Hóa đơn ${roomToExport.name}`);
        XLSX.writeFile(wb, `Hoa_Don_${roomToExport.name.replace(/\s+/g, '_')}.xlsx`);
    };

    const handleEditInvoiceFromMgmt = (invoice: any) => {
      const room = rooms.find((r: Room) => r.id === invoice.roomId);
      if (!room) return;
      const record = room.usageHistory.find(rec => rec.id === invoice.id);
      if (!record) return;
      setSelectedRoom(room);
      handleOpenEditUsageModal(record);
    };

    const handleDeleteInvoiceFromMgmt = (invoice: any) => {
      setInvoiceToDelete({ roomId: invoice.roomId, recordId: invoice.id });
    };

    const handleViewTenantFromMgmt = (invoice: any) => {
      handleOpenTenantDetailModal(invoice.tenantSnapshot);
    };


    return {
        isBrowserSupported,
        handleListen,
        openSearchMobile,
        closeSearchMobile,
        toggleTheme,
        openModal,
        closeModal,
        handleOpenInvoiceModal,
        handleCloseInvoiceModal,
        handleOpenAddRoomModal,
        handleOpenEditUsageModal,
        handleOpenCheckoutModal,
        handleOpenTenantDetailModal,
        handleOpenAddUserModal,
        handleOpenEditUserModal,
        handleNavigateToUserManagement,
        handleNavigateToInvoiceManagement,
        handleNavigateToEditProfile,
        handleNavigateBackToGrid,
        handleSuggestionClick,
        handleSearchKeyDown,
        handleUserPageChange,
        handleInvoicePageChange,
        handleRoomSelect,
        handleSetRoomFilter,
        handleExportInvoicesToExcel,
        handleEditInvoiceFromMgmt,
        handleDeleteInvoiceFromMgmt,
        handleViewTenantFromMgmt,
    };
};