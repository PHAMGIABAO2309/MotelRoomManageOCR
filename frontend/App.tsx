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
        if (showBeautifulBackground) {
            document.body.classList.add('aurora-background-active');
        } else {
            document.body.classList.remove('aurora-background-active');
        }
        return () => {
            document.body.classList.remove('aurora-background-active');
        };
    }, [showBeautifulBackground]);

    if (!isLoggedIn) {
        return <LoginView onLogin={appLogic.handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-200 flex flex-col">
            <Header appLogic={appLogic} />

            <main className={`flex-1 max-w-7xl mx-auto p-2 sm:p-6 lg:p-8 w-full ${showFooter ? 'pb-24 sm:pb-6 lg:pb-8' : ''}`}>
                <MainContent appLogic={appLogic} />
            </main>
            
            {canEdit && !isSubPage && !selectedRoom && (
                <FloatingActionButton onClick={handleOpenAddRoomModal} />
            )}

            {showFooter && <Footer rooms={rooms} onSetFilter={handleSetRoomFilter} currentFilter={roomFilterStatus} />}

            <ModalManager appLogic={appLogic} />
        </div>
    );
};

export default App;