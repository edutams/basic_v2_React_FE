
import { createContext, useState, useEffect } from 'react';
import config from './config'
import React from "react";



export const CustomizerContext = createContext(undefined);


export const CustomizerContextProvider = ({ children }) => {

    const [activeDir, setActiveDir] = useState(() => {
        return localStorage.getItem('activeDir') || config.activeDir;
    });
    const [activeMode, setActiveMode] = useState(() => {
        return localStorage.getItem('activeMode') || config.activeMode;
    });
    const [activeTheme, setActiveTheme] = useState(() => {
        return localStorage.getItem('activeTheme') || config.activeTheme;
    });
    const [activeLayout, setActiveLayout] = useState(() => {
        return localStorage.getItem('activeLayout') || config.activeLayout;
    });
    const [isCardShadow, setIsCardShadow] = useState(() => {
        const saved = localStorage.getItem('isCardShadow');
        return saved !== null ? JSON.parse(saved) : config.isCardShadow;
    });
    const [isLayout, setIsLayout] = useState(() => {
        return localStorage.getItem('isLayout') || config.isLayout;
    });
    const [isBorderRadius, setIsBorderRadius] = useState(() => {
        const saved = localStorage.getItem('isBorderRadius');
        return saved !== null ? JSON.parse(saved) : config.isBorderRadius;
    });
    const [isCollapse, setIsCollapse] = useState(() => {
        return localStorage.getItem('isCollapse') || config.isCollapse;
    });
    const [isLanguage, setIsLanguage] = useState(() => {
        return localStorage.getItem('isLanguage') || config.isLanguage;
    });
    const [isSidebarHover, setIsSidebarHover] = useState(false);
    const [isMobileSidebar, setIsMobileSidebar] = useState(false);
    const [primaryColor, setPrimaryColor] = useState(() => {
        return localStorage.getItem('primaryColor') || null;
    });

    // Wrapper functions to save to localStorage when values change
    const setActiveDirWithPersist = (value) => {
        setActiveDir(value);
        localStorage.setItem('activeDir', value);
    };

    const setActiveModeWithPersist = (value) => {
        setActiveMode(value);
        localStorage.setItem('activeMode', value);
    };

    const setActiveThemeWithPersist = (value) => {
        setActiveTheme(value);
        localStorage.setItem('activeTheme', value);
    };

    const setActiveLayoutWithPersist = (value) => {
        setActiveLayout(value);
        localStorage.setItem('activeLayout', value);
    };

    const setIsCardShadowWithPersist = (value) => {
        setIsCardShadow(value);
        localStorage.setItem('isCardShadow', JSON.stringify(value));
    };

    const setIsLayoutWithPersist = (value) => {
        setIsLayout(value);
        localStorage.setItem('isLayout', value);
    };

    const setIsBorderRadiusWithPersist = (value) => {
        setIsBorderRadius(value);
        localStorage.setItem('isBorderRadius', JSON.stringify(value));
    };

    const setIsCollapseWithPersist = (value) => {
        setIsCollapse(value);
        localStorage.setItem('isCollapse', value);
    };

    const setIsLanguageWithPersist = (value) => {
        setIsLanguage(value);
        localStorage.setItem('isLanguage', value);
    };

    const setPrimaryColorWithPersist = (value) => {
        setPrimaryColor(value);
        if (value) {
            localStorage.setItem('primaryColor', value);
        } else {
            localStorage.removeItem('primaryColor');
        }
    };
    // Set attributes immediately
    useEffect(() => {
        document.documentElement.setAttribute("class", activeMode);
        document.documentElement.setAttribute("dir", activeDir);
        document.documentElement.setAttribute('data-color-theme', activeTheme);
        document.documentElement.setAttribute("data-layout", activeLayout);
        document.documentElement.setAttribute("data-boxed-layout", isLayout);
        document.documentElement.setAttribute("data-sidebar-type", isCollapse);

        // Set CSS custom property for primary color (used by spinner, etc.)
        if (primaryColor) {
            document.documentElement.style.setProperty('--primary-color', primaryColor);
        } else {
            document.documentElement.style.removeProperty('--primary-color');
        }

    }, [activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse, primaryColor]);

    return (
        
        <CustomizerContext.Provider
            value={{
                activeDir,
                setActiveDir: setActiveDirWithPersist,
                activeMode,
                setActiveMode: setActiveModeWithPersist,
                activeTheme,
                setActiveTheme: setActiveThemeWithPersist,
                activeLayout,
                setActiveLayout: setActiveLayoutWithPersist,
                isCardShadow,
                setIsCardShadow: setIsCardShadowWithPersist,
                isLayout,
                setIsLayout: setIsLayoutWithPersist,
                isBorderRadius,
                setIsBorderRadius: setIsBorderRadiusWithPersist,
                isCollapse,
                setIsCollapse: setIsCollapseWithPersist,
                isLanguage,
                setIsLanguage: setIsLanguageWithPersist,
                isSidebarHover,
                setIsSidebarHover,
                isMobileSidebar,
                setIsMobileSidebar,
                primaryColor,
                setPrimaryColor: setPrimaryColorWithPersist
            }}
        >
            {children}
        </CustomizerContext.Provider>
    );
};

