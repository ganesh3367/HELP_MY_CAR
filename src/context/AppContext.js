import { createContext, useContext, useState } from 'react';
import { MECHANICS, TOWING_SERVICES } from '../constants/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [mechanics, setMechanics] = useState(MECHANICS);
    const [towingServices, setTowingServices] = useState(TOWING_SERVICES);
    const [favorites, setFavorites] = useState([]);

    const toggleFavorite = (id) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
        );
    };

    return (
        <AppContext.Provider
            value={{
                mechanics,
                towingServices,
                favorites,
                toggleFavorite,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
