import { PageType, Tenant } from './types';

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
        // Try to log in as admin/staff first
        const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            setIsLoggedIn(true);
            setCurrentUser(user as AuthenticatedUser);
            setCurrentPage(PageType.ROOM_GRID);
            setTenantRoom(null);
            return true;
        }
        
        // Try to log in as a tenant (username is room name, password is phone number)
        const roomMatch = rooms.find((room: any) => 
            room.name.toLowerCase().replace(/\s/g, '') === username.toLowerCase().replace(/\s/g, '')
        );

        if (roomMatch && roomMatch.tenants && roomMatch.tenants.length > 0) {
            const tenantMatch = roomMatch.tenants.find((t: Tenant) => t.phone === password);
            if (tenantMatch) {
                const tenantUser: AuthenticatedUser = {
                    id: tenantMatch.id,
                    name: tenantMatch.name,
                    username: roomMatch.name, // The room name is the username
                    role: 'Tenant'
                };
                setIsLoggedIn(true);
                setCurrentUser(tenantUser);
                setTenantRoom(roomMatch);
                setCurrentPage(PageType.TENANT_VIEW);
                return true;
            }
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