import { Room, Tenant, UsageRecord, ModalType } from './types';
import { ELECTRIC_RATE, WATER_RATE } from './constants';

export const createRoomHandlers = ({
    rooms,
    setRooms,
    selectedRoom,
    setSelectedRoom,
    setInvoiceToDelete,
    setDraggedItem,
    setDragOverItem,
    draggedItem,
    dragOverItem,
    searchQuery,
    invoiceToDelete,
    activeModal,
}: any) => {

    const updateRoomAndSelection = (updatedRooms: Room[], roomId: string) => {
        const newSelectedRoom = updatedRooms.find((r: Room) => r.id === roomId) || null;
        setRooms(updatedRooms);
        setSelectedRoom(newSelectedRoom);
    };

    const handleAddRoom = (name: string, baseRent: number) => {
        const newRoom: Room = {
            id: crypto.randomUUID(),
            name,
            baseRent,
            status: 'vacant',
            tenant: null,
            usageHistory: [],
            archivedUsageHistory: [],
            isPinned: false,
        };
        setRooms([...rooms, newRoom]);
    };

    const handleAssignTenant = (tenantData: Omit<Tenant, 'id'>) => {
        if (!selectedRoom) return;
        const newTenant: Tenant = { ...tenantData, id: crypto.randomUUID() };

        const updatedRooms = rooms.map((room: Room) => {
            if (room.id === selectedRoom.id) {
                // If the room has a history (from a previous tenant), archive it.
                const historyToArchive = room.usageHistory.length > 0 ? room.usageHistory : [];
                const newArchivedHistory = [...(room.archivedUsageHistory || []), ...historyToArchive];

                return {
                    ...room,
                    tenant: newTenant,
                    status: 'occupied' as const,
                    usageHistory: [], // Start fresh for the new tenant.
                    archivedUsageHistory: newArchivedHistory,
                };
            }
            return room;
        });
        updateRoomAndSelection(updatedRooms, selectedRoom.id);
    };

    const handleRemoveTenant = () => {
        if (!selectedRoom) return;
        const updatedRooms = rooms.map((room: Room) =>
            room.id === selectedRoom.id ? { ...room, tenant: null, status: 'vacant' as const } : room
        );
        updateRoomAndSelection(updatedRooms, selectedRoom.id);
    };

    const handleEditTenant = (updatedTenantData: Tenant) => {
        if (!selectedRoom) return;
        const updatedRooms = rooms.map((room: Room) =>
            room.id === selectedRoom.id ? { ...room, tenant: updatedTenantData } : room
        );
        updateRoomAndSelection(updatedRooms, selectedRoom.id);
    };

    const handleSaveUsage = (data: { electricReading: number, waterReading: number, startDate: string, endDate: string, recordId?: string, billAmount?: number, isPaid?: boolean, baseRent?: number }) => {
        if (!selectedRoom || !selectedRoom.tenant) return;

        if (activeModal === ModalType.CHECK_OUT) {
             const lastRecord = selectedRoom.usageHistory.length > 0 ? selectedRoom.usageHistory[selectedRoom.usageHistory.length - 1] : null;
            const electricUsage = lastRecord ? data.electricReading - lastRecord.electricReading : data.electricReading;
            const waterUsage = lastRecord ? data.waterReading - lastRecord.waterReading : data.waterReading;
            const rentForCheckout = data.baseRent !== undefined ? data.baseRent : selectedRoom.baseRent;
            const billAmount = rentForCheckout + (electricUsage * ELECTRIC_RATE) + (waterUsage * WATER_RATE);
            const finalRecord: UsageRecord = {
                id: crypto.randomUUID(),
                startDate: data.startDate,
                endDate: data.endDate,
                electricReading: data.electricReading,
                waterReading: data.waterReading,
                electricUsage,
                waterUsage,
                billAmount,
                isPaid: false,
                tenantSnapshot: selectedRoom.tenant,
            };

            const newHistoryWithFinalRecord = [...selectedRoom.usageHistory, finalRecord];

            const updatedRooms = rooms.map((room: Room) =>
                room.id === selectedRoom.id ? { 
                    ...room, 
                    // tenant object is kept for historical login purposes until a new tenant is assigned.
                    status: 'vacant' as const, 
                    usageHistory: newHistoryWithFinalRecord, // Keep the history visible for the manager
                } : room
            );
            updateRoomAndSelection(updatedRooms, selectedRoom.id);
            return;
        }

        const newHistory = [...selectedRoom.usageHistory];
        let recordIndex: number;

        if (data.recordId) { // Edit mode
            recordIndex = newHistory.findIndex(r => r.id === data.recordId);
            if (recordIndex === -1) return;
            
            const prevRecord = recordIndex > 0 ? newHistory[recordIndex - 1] : null;
            const electricUsage = data.electricReading - (prevRecord ? prevRecord.electricReading : 0);
            const waterUsage = data.waterReading - (prevRecord ? prevRecord.waterReading : 0);

            const billAmount = data.billAmount !== undefined
                ? data.billAmount
                : selectedRoom.baseRent + (electricUsage * ELECTRIC_RATE) + (waterUsage * WATER_RATE);

            newHistory[recordIndex] = {
                ...newHistory[recordIndex],
                startDate: data.startDate,
                endDate: data.endDate,
                electricReading: data.electricReading,
                waterReading: data.waterReading,
                electricUsage,
                waterUsage,
                billAmount,
                isPaid: data.isPaid ?? newHistory[recordIndex].isPaid,
            };
        } else { // Add mode
            const lastRecord = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
            const electricUsage = lastRecord ? data.electricReading - lastRecord.electricReading : data.electricReading;
            const waterUsage = lastRecord ? data.waterReading - lastRecord.waterReading : data.waterReading;
            const billAmount = selectedRoom.baseRent + (electricUsage * ELECTRIC_RATE) + (waterUsage * WATER_RATE);

            const newRecord: UsageRecord = {
                id: crypto.randomUUID(),
                startDate: data.startDate,
                endDate: data.endDate,
                electricReading: data.electricReading,
                waterReading: data.waterReading,
                electricUsage,
                waterUsage,
                billAmount,
                isPaid: false,
                tenantSnapshot: selectedRoom.tenant,
            };
            newHistory.push(newRecord);
            recordIndex = newHistory.length - 2;
        }

        if (recordIndex >= 0 && recordIndex < newHistory.length - 1) {
            const updatedCurrentRecord = newHistory[recordIndex];
            const nextRecord = newHistory[recordIndex + 1];

            const nextElectricUsage = nextRecord.electricReading - updatedCurrentRecord.electricReading;
            const nextWaterUsage = nextRecord.waterReading - updatedCurrentRecord.waterReading;
            const nextBillAmount = selectedRoom.baseRent + (nextElectricUsage * ELECTRIC_RATE) + (nextWaterUsage * WATER_RATE);
            
            newHistory[recordIndex + 1] = {
                ...nextRecord,
                electricUsage: nextElectricUsage,
                waterUsage: nextWaterUsage,
                billAmount: nextBillAmount,
            };
        }
        
        const updatedRooms = rooms.map((room: Room) =>
            room.id === selectedRoom.id ? { ...room, usageHistory: newHistory } : room
        );
        updateRoomAndSelection(updatedRooms, selectedRoom.id);
    };

    const handleOpenDeleteInvoiceConfirm = (recordId: string) => {
        if (!selectedRoom) return;
        setInvoiceToDelete({ roomId: selectedRoom.id, recordId });
    };

    const handleConfirmDeleteInvoice = () => {
        if (!invoiceToDelete) return;
        const { roomId, recordId } = invoiceToDelete;
        
        const roomToUpdate = rooms.find((r: Room) => r.id === roomId);
        if (!roomToUpdate) return;
        
        const history = roomToUpdate.usageHistory;
        const recordIndex = history.findIndex((r: any) => r.id === recordId);

        if (recordIndex === -1) {
            setInvoiceToDelete(null);
            return;
        }

        const newHistory = history.filter((r: any) => r.id !== recordId);
        
        if (recordIndex < newHistory.length) {
            const recordToUpdate = newHistory[recordIndex];
            const prevRecord = recordIndex > 0 ? newHistory[recordIndex - 1] : null;

            const electricUsage = recordToUpdate.electricReading - (prevRecord ? prevRecord.electricReading : 0);
            const waterUsage = recordToUpdate.waterReading - (prevRecord ? prevRecord.waterReading : 0);
            const billAmount = roomToUpdate.baseRent + (electricUsage * ELECTRIC_RATE) + (waterUsage * WATER_RATE);
            
            newHistory[recordIndex] = {
                ...recordToUpdate,
                electricUsage,
                waterUsage,
                billAmount,
            };
        }
        
        const updatedRooms = rooms.map((room: Room) =>
            room.id === roomId ? { ...room, usageHistory: newHistory } : room
        );
        updateRoomAndSelection(updatedRooms, roomId);
        setInvoiceToDelete(null);
    };
    
    const handleMarkAsPaid = (roomId: string, recordId: string) => {
        const updatedRooms = rooms.map((room: Room) => {
            if (room.id !== roomId) return room;
            const updatedHistory = room.usageHistory.map(record =>
                record.id === recordId ? { ...record, isPaid: true } : record
            );
            return { ...room, usageHistory: updatedHistory };
        });
        
        if (selectedRoom && selectedRoom.id === roomId) {
            updateRoomAndSelection(updatedRooms, roomId);
        } else {
            setRooms(updatedRooms);
        }
    };

    const handleTogglePin = (roomId: string) => {
        const updatedRoomsWithToggle = rooms.map((room: Room) =>
            room.id === roomId ? { ...room, isPinned: !room.isPinned } : room
        );

        const pinned = updatedRoomsWithToggle.filter((r: Room) => r.isPinned);
        const unpinned = updatedRoomsWithToggle.filter((r: Room) => !r.isPinned);

        setRooms([...pinned, ...unpinned]);
    };

    const handleDragStart = (room: Room) => { if (searchQuery) return; setDraggedItem(room); };
    const handleDragEnter = (targetRoom: Room) => { if (searchQuery || !draggedItem || draggedItem.id === targetRoom.id) return; setDragOverItem(targetRoom); };
    
    const handleDragEnd = () => {
        if (!draggedItem || !dragOverItem || draggedItem.id === dragOverItem.id) {
            setDraggedItem(null); 
            setDragOverItem(null); 
            return; 
        }
        if (!!draggedItem.isPinned !== !!dragOverItem.isPinned) {
            setDraggedItem(null); 
            setDragOverItem(null); 
            return;
        }

        const newRooms = [...rooms];
        const draggedIndex = newRooms.findIndex((r: Room) => r.id === draggedItem.id);
        const targetIndex = newRooms.findIndex((r: Room) => r.id === dragOverItem.id);
        const [removed] = newRooms.splice(draggedIndex, 1);
        newRooms.splice(targetIndex, 0, removed);
        setRooms(newRooms);
        setDraggedItem(null); 
        setDragOverItem(null);
    };

    const handleTouchStart = (e: React.TouchEvent, room: Room) => {
        if (searchQuery) return;
        setDraggedItem(room);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (searchQuery || !draggedItem) return;
        
        e.preventDefault();

        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (!targetElement) {
            setDragOverItem(null);
            return;
        }

        const cardElement = targetElement.closest('[data-room-id]');
        
        if (cardElement && cardElement.getAttribute('data-room-id') !== draggedItem.id) {
            const targetRoomId = cardElement.getAttribute('data-room-id');
            const targetRoom = rooms.find((r: Room) => r.id === targetRoomId);
            if (targetRoom) {
                setDragOverItem(targetRoom);
            }
        }
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };


    return {
        handleAddRoom,
        handleAssignTenant,
        handleRemoveTenant,
        handleEditTenant,
        handleSaveUsage,
        handleOpenDeleteInvoiceConfirm,
        handleConfirmDeleteInvoice,
        handleMarkAsPaid,
        handleTogglePin,
        handleDragStart,
        handleDragEnter,
        handleDragEnd,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    };
};