
import { createContext, useState, useEffect } from 'react';
import config from './config'
import React from "react";



// Create the context with an initial value
export const CustomizerContext = createContext(undefined);


// Create the provider component
export const CustomizerContextProvider = ({ children }) => {

    const [activeDir, setActiveDir] = useState(config.activeDir);
    const [activeMode, setActiveMode] = useState(config.activeMode);
    const [activeTheme, setActiveTheme] = useState(config.activeTheme);
    const [activeLayout, setActiveLayout] = useState(config.activeLayout);
    const [isCardShadow, setIsCardShadow] = useState(config.isCardShadow);
    const [isLayout, setIsLayout] = useState(config.isLayout);
    const [isBorderRadius, setIsBorderRadius] = useState(config.isBorderRadius);
    const [isCollapse, setIsCollapse] = useState(config.isCollapse);
    const [isLanguage, setIsLanguage] = useState(config.isLanguage);
    const [isSidebarHover, setIsSidebarHover] = useState(false);
    const [isMobileSidebar, setIsMobileSidebar] = useState(false);
    const [primaryColor, setPrimaryColor] = useState(null);
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
                setActiveDir,
                activeMode,
                setActiveMode,
                activeTheme,
                setActiveTheme,
                activeLayout,
                setActiveLayout,
                isCardShadow,
                setIsCardShadow,
                isLayout,
                setIsLayout,
                isBorderRadius,
                setIsBorderRadius,
                isCollapse,
                setIsCollapse,
                isLanguage,
                setIsLanguage,
                isSidebarHover,
                setIsSidebarHover,
                isMobileSidebar,
                setIsMobileSidebar,
                primaryColor,
                setPrimaryColor
            }}
        >
            {children}
        </CustomizerContext.Provider>
    );
};

