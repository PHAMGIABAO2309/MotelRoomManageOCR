import React, { useEffect } from 'react';
import { useAppLogic } from './hooks';
import LoginView from './components/LoginView';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ModalManager from './components/ModalManager';
import FloatingActionButton from './components/FloatingActionButton';
import Footer from './components/Footer';

const App: React.FC = () => {
    const appLogic = useAppLogic();
    const { 
      isLoggedIn, 
      showBeautifulBackground, 
      showFooter, 
      canEdit, 
      isSubPage, 
      selectedRoom, 
      rooms,
      handleOpenAddRoomModal,
      roomFilterStatus,
      handleSetRoomFilter,
    } = appLogic;

    useEffect(() => {
        // This class is now used for the more subtle aurora effect on the room grid
        if (showBeautifulBackground) {
            document.body.classList.add('aurora-subtle-background');
        } else {
            document.body.classList.remove('aurora-subtle-background');
        }
        return () => {
            document.body.classList.remove('aurora-subtle-background');
        };
    }, [showBeautifulBackground]);


    return (
        <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-200 flex flex-col">
            <Header appLogic={appLogic} />

            <main className={`flex-1 flex flex-col w-full ${isLoggedIn ? 'max-w-7xl mx-auto p-2 sm:p-6 lg:p-8' : 'items-center justify-center p-4'}`}>
                {isLoggedIn ? (
                    <MainContent appLogic={appLogic} />
                ) : (
                    <LoginView onLogin={appLogic.handleLogin} />
                )}
            </main>
            
            {isLoggedIn && canEdit && !selectedRoom && !isSubPage && (
                <FloatingActionButton onClick={handleOpenAddRoomModal} />
            )}

            {isLoggedIn && showFooter && <Footer rooms={rooms} onSetFilter={handleSetRoomFilter} currentFilter={roomFilterStatus} />}

            <ModalManager appLogic={appLogic} />
        </div>
    );
};

export default App;