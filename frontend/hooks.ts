import { useState, useEffect, useRef } from 'react';
import { Room, Tenant, ModalType, UsageRecord, User, PageType, Notification } from './types';
import { createRoomHandlers } from './roomHandlers';
import { createUIHandlers } from './uiHandlers';
import { createUserHandlers } from './userHandlers';
import { useAppSelectors } from './selectors';

type AuthenticatedUser = Omit<User, 'role'> & { role: 'Admin' | 'Staff' | 'Tenant' };

const tenant1: Tenant = {
  id: 'tenant-1',
  name: 'Nguyễn Văn An',
  phone: '0901234567',
  moveInDate: new Date('2023-01-15').toISOString(),
  dateOfBirth: new Date('1995-08-20').toISOString(),
  sex: "Nam",
  nationality: "Việt Nam",
  idNumber: "012345678910",
  placeOfOrigin: "Hà Nội",
  placeOfResidence: "TP. Hồ Chí Minh",
  occupation: "Kỹ sư phần mềm",
};

const initialRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Phòng 101',
    status: 'occupied',
    baseRent: 2000000,
    tenants: [tenant1],
    usageHistory: [
      {
        id: 'usage-1',
        startDate: new Date('2023-01-15').toISOString(),
        endDate: new Date('2023-02-15').toISOString(),
        electricReading: 100,
        waterReading: 10,
        electricUsage: 100,
        waterUsage: 10,
        billAmount: 2600000,
        isPaid: true,
        tenantsSnapshot: [tenant1],
      },
       {
        id: 'usage-2',
        startDate: new Date('2023-02-15').toISOString(),
        endDate: new Date('2023-03-15').toISOString(),
        electricReading: 150,
        waterReading: 15,
        electricUsage: 50,
        waterUsage: 5,
        billAmount: 2300000,
        isPaid: false,
        tenantsSnapshot: [tenant1],
      },
    ],
    archivedUsageHistory: [],
  },
  {
    id: 'room-2',
    name: 'Phòng 102',
    status: 'vacant',
    baseRent: 1800000,
    tenants: [],
    usageHistory: [],
    archivedUsageHistory: [],
  }
];

const initialUsers: User[] = [
    { id: 'user-1', name: 'Chủ nhà', username: 'admin', password: 'password123', role: 'Admin', avatarUrl: '' },
    { id: 'user-2', name: 'Nhân viên An', username: 'an.nv', password: 'password123', role: 'Staff', avatarUrl: '' },
    { id: 'user-3', name: 'Nhân viên Bình', username: 'binh.nv', password: 'password123', role: 'Staff', avatarUrl: '' },
    { id: 'user-4', name: 'Quản lý Chi', username: 'chi.ql', password: 'password123', role: 'Admin', avatarUrl: '' },
    { id: 'user-5', name: 'Lễ tân Dung', username: 'dung.lt', password: 'password123', role: 'Staff', avatarUrl: '' },
    { id: 'user-6', name: 'Kế toán Giang', username: 'giang.kt', password: 'password123', role: 'Staff', avatarUrl: '' },
    { id: 'user-7', name: 'Bảo vệ Hải', username: 'hai.bv', password: 'password123', role: 'Staff', avatarUrl: '' },
];


export const useAppLogic = () => {
    // --- CORE STATE ---
    const [rooms, setRooms] = useState<Room[]>(() => {
        const savedRooms = localStorage.getItem('motelRooms');
        const initial = savedRooms ? JSON.parse(savedRooms) : initialRooms;
        const pinned = initial.filter((r: Room) => r.isPinned);
        const unpinned = initial.filter((r: Room) => !r.isPinned);
        return [...pinned, ...unpinned];
    });
    const [users, setUsers] = useState<User[]>(() => {
        const savedUsers = localStorage.getItem('motelUsers');
        const parsedUsers = savedUsers ? JSON.parse(savedUsers) : initialUsers;
        return parsedUsers.map((u: User) => ({ ...u, password: u.password || 'password123' }));
    });
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
    const [suggestedRoomInfo, setSuggestedRoomInfo] = useState<{ name: string; rent?: number }>({ name: '' });
    const [invoiceToView, setInvoiceToView] = useState<{ room: Room, record: UsageRecord } | null>(null);
    const [recordToEdit, setRecordToEdit] = useState<UsageRecord | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [tenantRoom, setTenantRoom] = useState<Room | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        if(savedUser) {
            const user = JSON.parse(savedUser);
            if(user.role === 'Tenant') {
                const savedRooms = localStorage.getItem('motelRooms');
                const allRooms: Room[] = savedRooms ? JSON.parse(savedRooms) : initialRooms;
                return allRooms.find(r => r.name === user.username) || null;
            }
        }
        return null;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isRoomSelectorOpen, setIsRoomSelectorOpen] = useState(false);
    const [roomSelectorQuery, setRoomSelectorQuery] = useState('');
    const [currentPage, setCurrentPage] = useState<PageType>(() => {
        const savedUser = localStorage.getItem('currentUser');
        if(savedUser) {
          const user = JSON.parse(savedUser);
          if(user.role === 'Tenant') return PageType.TENANT_VIEW;
        }
        return PageType.ROOM_GRID;
    });
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [invoiceToDelete, setInvoiceToDelete] = useState<{roomId: string, recordId: string} | null>(null);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [isSearchActiveMobile, setIsSearchActiveMobile] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [draggedItem, setDraggedItem] = useState<Room | null>(null);
    const [dragOverItem, setDragOverItem] = useState<Room | null>(null);
    const [roomFilterStatus, setRoomFilterStatus] = useState<'all' | 'occupied' | 'vacant'>('all');
    const [invoiceForQR, setInvoiceForQR] = useState<{ room: Room, record: UsageRecord } | null>(null);
    const [tenantToView, setTenantToView] = useState<Tenant | null>(null);

    // Notification State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

    // State for InvoiceManagementView
    const [invoiceFilterRoomId, setInvoiceFilterRoomId] = useState('all');
    const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [invoiceSortBy, setInvoiceSortBy] = useState<'newest' | 'oldest'>('newest');
    const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
    const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
    
    // State for Tenant Archive View
    const [tenantArchiveSearchQuery, setTenantArchiveSearchQuery] = useState('');
    const [tenantArchiveCurrentPage, setTenantArchiveCurrentPage] = useState(1);
    const [tenantArchiveFilterRoomId, setTenantArchiveFilterRoomId] = useState('all');


    // --- REFS ---
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const settingsMenuRef = useRef<HTMLDivElement>(null);
    const roomSelectorRef = useRef<HTMLDivElement>(null);
    const roomSelectorInputRef = useRef<HTMLInputElement>(null);
    const notificationPanelRef = useRef<HTMLDivElement>(null);
    // Refs for mobile drag-and-drop
    const touchStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressRef = useRef(false);
    const initialTouchPositionRef = useRef<{ x: number, y: number } | null>(null);
    
    // --- EFFECTS ---
    useEffect(() => { localStorage.setItem('motelRooms', JSON.stringify(rooms)); }, [rooms]);
    useEffect(() => { localStorage.setItem('motelUsers', JSON.stringify(users)); }, [users]);
    useEffect(() => {
        localStorage.setItem('isLoggedIn', String(isLoggedIn));
        if (isLoggedIn && currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [isLoggedIn, currentUser]);
    
    useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setIsSearchFocused(false);
        if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) setIsSettingsOpen(false);
        if (roomSelectorRef.current && !roomSelectorRef.current.contains(event.target as Node)) setIsRoomSelectorOpen(false);
        if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) setIsNotificationPanelOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { setUserCurrentPage(1); }, [userSearchQuery]);
    useEffect(() => { setInvoiceCurrentPage(1); }, [invoiceSearchQuery, invoiceFilterRoomId, invoiceFilterStatus]);
    useEffect(() => { setTenantArchiveCurrentPage(1); }, [tenantArchiveSearchQuery, tenantArchiveFilterRoomId]);
    
    useEffect(() => {
        if (isRoomSelectorOpen) {
            const timer = setTimeout(() => roomSelectorInputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [isRoomSelectorOpen]);

     // --- SELECTORS (Derived State) ---
    const selectors = useAppSelectors({
        rooms, users, searchQuery, userSearchQuery, userCurrentPage, roomSelectorQuery, isLoggedIn, currentUser,
        currentPage, selectedRoom, roomFilterStatus, invoiceSearchQuery, invoiceFilterRoomId,
        invoiceFilterStatus, invoiceSortBy, invoiceCurrentPage, tenantArchiveSearchQuery, tenantArchiveCurrentPage,
        tenantArchiveFilterRoomId,
    });
    const { canEdit } = selectors;

    // Notification Generation Effect
    useEffect(() => {
        if (!canEdit) {
            setNotifications([]);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newNotifications: Notification[] = [];

        rooms.forEach((room: Room) => {
            if (room.status === 'occupied') {
                room.usageHistory.forEach((record: UsageRecord) => {
                    if (!record.isPaid) {
                        const endDate = new Date(record.endDate);
                        endDate.setHours(0, 0, 0, 0);
                        const diffTime = today.getTime() - endDate.getTime();
                        
                        if (diffTime >= 0) {
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            let message = '';
                            if (diffDays === 0) {
                                message = `Hóa đơn phòng ${room.name} đến hạn hôm nay.`;
                            } else {
                                message = `Hóa đơn phòng ${room.name} đã quá hạn ${diffDays} ngày.`;
                            }
                            
                            newNotifications.push({
                                id: `notif-${record.id}`,
                                roomId: room.id,
                                recordId: record.id,
                                message: message,
                                date: record.endDate,
                            });
                        }
                    }
                });
            }
        });

        newNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (JSON.stringify(newNotifications) !== JSON.stringify(notifications)) {
            setNotifications(newNotifications);
            if(newNotifications.length > 0) {
                setHasUnreadNotifications(true);
            }
        }
    }, [rooms, canEdit]);


    // --- CONTEXT for handlers/selectors ---
    // This object bundles all state, setters, and refs to pass to external logic files
    const logicContext = {
        // State
        rooms, users, selectedRoom, activeModal, suggestedRoomInfo, invoiceToView, recordToEdit,
        isLoggedIn, currentUser, tenantRoom, searchQuery, isSearchFocused, highlightedIndex, isSettingsOpen,
        isLogoutConfirmOpen, isRoomSelectorOpen, roomSelectorQuery, currentPage, userToEdit, userToDelete,
        invoiceToDelete, userSearchQuery, userCurrentPage, theme, isListening, draggedItem, dragOverItem,
        isSearchActiveMobile, roomFilterStatus, invoiceForQR, invoiceFilterRoomId, invoiceFilterStatus, invoiceSortBy,
        invoiceSearchQuery, invoiceCurrentPage, notifications, isNotificationPanelOpen, hasUnreadNotifications,
        tenantArchiveSearchQuery, tenantArchiveCurrentPage, tenantArchiveFilterRoomId,
        tenantToView,
        // Setters
        setRooms, setUsers, setSelectedRoom, setActiveModal, setSuggestedRoomInfo, setInvoiceToView,
        setRecordToEdit, setIsLoggedIn, setCurrentUser, setTenantRoom, setSearchQuery,
        setIsSearchFocused, setHighlightedIndex, setIsSettingsOpen, setIsLogoutConfirmOpen, setIsRoomSelectorOpen,
        setRoomSelectorQuery, setCurrentPage, setUserToEdit, setUserToDelete, setInvoiceToDelete, setUserSearchQuery,
        setUserCurrentPage, setTheme, setIsListening, setDraggedItem, setDragOverItem, setIsSearchActiveMobile,
        setRoomFilterStatus, setInvoiceForQR, setInvoiceFilterRoomId, setInvoiceFilterStatus, setInvoiceSortBy,
        setInvoiceSearchQuery, setInvoiceCurrentPage, setNotifications, setIsNotificationPanelOpen, setHasUnreadNotifications,
        setTenantArchiveSearchQuery, setTenantArchiveCurrentPage, setTenantArchiveFilterRoomId,
        setTenantToView,
        // Refs
        recognitionRef, searchInputRef, searchContainerRef, settingsMenuRef, roomSelectorRef, roomSelectorInputRef, notificationPanelRef,
        touchStartTimeoutRef, isLongPressRef, initialTouchPositionRef,
    };

    // --- HANDLERS ---
    const roomHandlers = createRoomHandlers(logicContext);
    const userHandlers = createUserHandlers(logicContext);
    const uiHandlers = createUIHandlers(logicContext, selectors);

    // This one effect depends on a handler, so it stays here.
    useEffect(() => {
        if (!uiHandlers.isBrowserSupported) return;
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognitionAPI();
        const recognition = recognitionRef.current;
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            setIsSearchFocused(true);
            setHighlightedIndex(-1);
        };
    }, [uiHandlers.isBrowserSupported]);

    return {
        // State & Setters
        ...logicContext,
        // Handlers
        ...roomHandlers,
        ...userHandlers,
        ...uiHandlers,
        // Selectors (Derived State)
        ...selectors
    };
};