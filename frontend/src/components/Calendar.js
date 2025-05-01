import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { API_ENDPOINTS } from '../config/api';
import api from '../api/axios';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await api.get(API_ENDPOINTS.events);
                setEvents(response.data);
                setError(null);
            } catch (err) {
                console.error('Calendar events fetch error:', err);
                
                // Extract the most useful error message
                let errorMessage = 'Failed to fetch events';
                
                if (err.response) {
                    // Server responded with an error status
                    errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
                    
                    // If there's more specific error information in the response data
                    if (err.response.data && err.response.data.message) {
                        errorMessage += ` - ${err.response.data.message}`;
                    }
                } else if (err.request) {
                    // Request made but no response received
                    errorMessage = 'No response from server. Please check if the backend is running.';
                } else {
                    // Error setting up the request
                    errorMessage = err.message || errorMessage;
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        return { daysInMonth, startingDay };
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
        const days = [];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.start);
                return eventDate.toDateString() === date.toDateString();
            });

            days.push(
                <div key={day} className="calendar-day">
                    <div className="day-number">{day}</div>
                    {dayEvents.length > 0 && (
                        <div className="day-events">
                            {dayEvents.map(event => (
                                <div key={event.id} className={`event ${event.type}`}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="calendar">
                <div className="calendar-header">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    >
                        Previous
                    </button>
                    <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    >
                        Next
                    </button>
                </div>
                <div className="calendar-grid">
                    <div className="calendar-weekday">Sun</div>
                    <div className="calendar-weekday">Mon</div>
                    <div className="calendar-weekday">Tue</div>
                    <div className="calendar-weekday">Wed</div>
                    <div className="calendar-weekday">Thu</div>
                    <div className="calendar-weekday">Fri</div>
                    <div className="calendar-weekday">Sat</div>
                    {days}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading calendar...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="calendar-container">
            <h1>Calendar</h1>
            {renderCalendar()}
        </div>
    );
};

export default Calendar; 