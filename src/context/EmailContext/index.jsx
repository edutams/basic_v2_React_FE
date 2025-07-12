"use client"
import React, { createContext, useState, Dispatch, SetStateAction, useEffect } from 'react';

import useSWR from 'swr';
import { deleteFetcher, getFetcher } from 'src/api/globalFetcher';


const initialEmailContext = {
    emails: [],
    selectedEmail: null,
    filter: 'inbox',
    searchQuery: '',
    loading: true,
    error: null,
    setSelectedEmail: () => { },
    deleteEmail: () => { },
    toggleStar: () => { },
    toggleImportant: () => { },
    setFilter: () => { },
    setSearchQuery: () => { },
};

export const EmailContext = createContext(initialEmailContext);

export const EmailContextProvider = ({ children }) => {
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filter, setFilter] = useState('inbox');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load emails from localStorage on mount
    useEffect(() => {
        const storedEmails = localStorage.getItem('emails');
        if (storedEmails) {
            const parsedEmails = JSON.parse(storedEmails);
            setEmails(parsedEmails);
            if (parsedEmails.length > 0) {
                setSelectedEmail(parsedEmails[0]);
            }
        } else {
            // Seed with example email if no emails exist
            const exampleEmail = {
                id: Date.now(),
                from: 'Me',
                to: 'john@email.com',
                toName: 'John Doe',
                subject: 'Hello',
                message: 'Hi John, this is a test email.',
                emailExcerpt: 'Hi John, this is a test email.',
                sent: true,
                inbox: false,
                draft: false,
                trash: false,
                spam: false,
                unread: false,
                time: new Date().toISOString(),
                attchments: [],
                label: '',
            };
            setEmails([exampleEmail]);
            setSelectedEmail(exampleEmail);
            localStorage.setItem('emails', JSON.stringify([exampleEmail]));
        }
        setLoading(false);
    }, []);

    // Save emails to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('emails', JSON.stringify(emails));
    }, [emails]);

    // Add a new sent email
    const sendEmail = (newEmail) => {
        setEmails(prev => [
            {
                ...newEmail,
                from: "Me", // Set sender name
                toName: newEmail.toName || (newEmail.to === 'me' || newEmail.to === 'Me' ? 'Me' : newEmail.toName),
                emailExcerpt: newEmail.message ? newEmail.message.substring(0, 60) : '', // Add message preview
                id: Date.now(),
                sent: true,
                inbox: false,
                draft: false,
                trash: false,
                spam: false,
                unread: false,
                time: new Date().toISOString(),
                attchments: newEmail.attachment
                    ? [{
                        id: `#${Date.now()}Attach`,
                        image: URL.createObjectURL(newEmail.attachment),
                        title: newEmail.attachment.name,
                        fileSize: `${(newEmail.attachment.size / 1024 / 1024).toFixed(2)}MB`,
                    }]
                    : [],
            },
            ...prev,
        ]);
    };

    const deleteEmail = async (emailId) => {
        setEmails((prevEmails) => prevEmails.filter(email => email.id !== emailId));
        if (selectedEmail && selectedEmail.id === emailId) {
            setSelectedEmail(null);
        }
    };

    const toggleStar = (emailId) => {
        setEmails(prevEmails =>
            prevEmails.map(email =>
                email.id === emailId ? { ...email, starred: !email.starred } : email
            )
        );

        if (selectedEmail?.id === emailId) {
            setSelectedEmail((prevEmail) => ({
                ...(prevEmail),
                starred: !(prevEmail).starred
            }));
        }
    };

    const toggleImportant = (emailId) => {
        setEmails(prevEmails =>
            prevEmails.map(email =>
                email.id === emailId ? { ...email, important: !email.important } : email
            )
        );

        if (selectedEmail?.id === emailId) {
            setSelectedEmail((prevEmail) => ({
                ...(prevEmail),
                important: !(prevEmail).important
            }));
        }
    };

    return (
        <EmailContext.Provider value={{ emails, selectedEmail, setSelectedEmail, deleteEmail, toggleStar, toggleImportant, setFilter, filter, error, loading, searchQuery, setSearchQuery, sendEmail }}>
            {children}
        </EmailContext.Provider>
    );
};