import { PageType } from './types';

// Moved and improved the normalization function for better performance and reliability.
const normalizeVietnamese = (str: string) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/đ/g, 'd') // Convert 'đ' to 'd'
        .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
};

export const createUserHandlers = ({
    users,
    setUsers,
    rooms,
    setIsLoggedIn,
    setCurrentUser,
    setCurrentPage,
    setTenantRoom,
    setSelectedRoom,
    setIsSettingsOpen,
    setUserToDelete,
    userToDelete,
    currentUser
}: any) => {
    
    type AuthenticatedUser = any; // Simplified for brevity

    const handleLogin = (username: string, password: string): boolean => {
        const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            setIsLoggedIn(true);
            setCurrentUser(user as AuthenticatedUser);
            setCurrentPage(PageType.ROOM_GRID);
            setTenantRoom(null);
            return true;
        }
        
        const roomMatch = rooms.find((room: any) => {
            if (!room.tenant) {
                return false;
            }

            // Extract number from room name, e.g., "Phòng 101" -> "101"
            const roomNumberMatch = room.name.match(/\d+/);
            if (!roomNumberMatch) {
                return false;
            }
            const roomNumber = roomNumberMatch[0];

            // Construct expected credentials
            const expectedUsername = `phong${roomNumber}`;
            const expectedPassword = roomNumber;

            // Compare with user input
            return normalizeVietnamese(username) === expectedUsername && password === expectedPassword;
        });


        if (roomMatch && roomMatch.tenant) {
            const tenantUser: AuthenticatedUser = {
                id: roomMatch.tenant.id,
                name: roomMatch.tenant.name,
                username: roomMatch.name,
                role: 'Tenant'
            };
            setIsLoggedIn(true);
            setCurrentUser(tenantUser);
            setTenantRoom(roomMatch);
            setCurrentPage(PageType.TENANT_VIEW);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setSelectedRoom(null);
        setTenantRoom(null);
        setCurrentPage(PageType.ROOM_GRID);
        setIsSettingsOpen(false);
    };

    const handleAddUser = (user: any) => {
        setUsers([...users, user]);
    };

    const handleUpdateUser = (updatedUser: any) => {
        setUsers(users.map((u: any) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
    };
    
    const handleUpdateProfile = async (updatedData: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) {
                return reject(new Error("Không tìm thấy người dùng hiện tại."));
            }

            const userToUpdate = users.find((u: any) => u.id === currentUser.id);
            if (!userToUpdate) {
                return reject(new Error("Người dùng không tồn tại."));
            }

            let finalUser = { 
                ...userToUpdate, 
                name: updatedData.name!, 
                username: updatedData.username!,
                avatarUrl: updatedData.avatarUrl,
            };

            if (updatedData.newPassword) {
                finalUser.password = updatedData.newPassword;
            }

            const updatedUsers = users.map((u: any) => (u.id === currentUser.id ? finalUser : u));
            setUsers(updatedUsers);
            setCurrentUser(finalUser as AuthenticatedUser);
            resolve();
        });
    };

    const handleOpenDeleteUserConfirm = (user: any) => setUserToDelete(user);

    const handleDeleteUser = () => {
        if (!userToDelete) return;
        setUsers(users.filter((u: any) => u.id !== userToDelete.id));
        setUserToDelete(null);
    };

    return {
        handleLogin,
        handleLogout,
        handleAddUser,
        handleUpdateUser,
        handleUpdateProfile,
        handleOpenDeleteUserConfirm,
        handleDeleteUser
    };
};