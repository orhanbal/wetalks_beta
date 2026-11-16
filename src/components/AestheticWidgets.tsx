import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Calendar, ExternalLink, Cloud, CloudSun, CloudRain, Sun, CloudSnow, CloudLightning, MapPin, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CityWeather {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  condition: string;
  icon: string;
}

interface AestheticWidgetsProps {
  isOpenCalendarDropdown?: boolean;
  setIsOpenCalendarDropdown?: (open: boolean) => void;
  mergedCalendarEventsCount?: number;
  dropdownContent?: React.ReactNode;
  
  // Custom added props to render calendar directly inside
  mergedCalendarEvents?: any[];
  subscribedEventIds?: string[];
  setSubscribedEventIds?: (ids: string[]) => void;
  alertSoundOn?: boolean;
  setAlertSoundOn?: (on: boolean) => void;
  calendarToast?: any;
  setCalendarToast?: (toast: any) => void;
  onNavigate?: (view: string, params?: any) => void;
  onAddNotification?: (notif: any) => void;
  onMarkNotificationRead?: (id: string) => void;
  eventRelatedNotifications?: any[];
  currentUser?: any;
  playPluckSynth?: (type: string) => void;
}

const CITIES: CityWeather[] = [
  { name: 'İstanbul', lat: 41.0082, lon: 28.9784, temp: 24, condition: 'Güneşli', icon: 'sun' },
  { name: 'Ankara', lat: 39.9334, lon: 32.8597, temp: 21, condition: 'Parçalı Bulutlu', icon: 'cloud-sun' },
  { name: 'İzmir', lat: 38.4192, lon: 27.1287, temp: 28, condition: 'Güneşli', icon: 'sun' },
  { name: 'Antalya', lat: 36.8969, lon: 30.7133, temp: 31, condition: 'Açık', icon: 'sun' },
  { name: 'Bursa', lat: 40.1885, lon: 29.0610, temp: 23, condition: 'Bulutlu', icon: 'cloud' },
  { name: 'Trabzon', lat: 41.0027, lon: 39.7168, temp: 19, condition: 'Yağmurlu', icon: 'rain' },
  { name: 'Eskişehir', lat: 39.7767, lon: 30.5206, temp: 20, condition: 'Hafif Rüzgarlı', icon: 'cloud-sun' },
  { name: 'Adana', lat: 37.0000, lon: 35.3213, temp: 30, condition: 'Sıcak', icon: 'sun' },
  { name: 'Muğla', lat: 37.2153, lon: 28.3636, temp: 27, condition: 'Güneşli', icon: 'sun' },
  { name: 'Gaziantep', lat: 37.0662, lon: 37.3833, temp: 26, condition: 'Açık', icon: 'sun' }
];

export default function AestheticWidgets({
  isOpenCalendarDropdown = false,
  setIsOpenCalendarDropdown = () => {},
  mergedCalendarEventsCount = 0,
  dropdownContent = null,
  
  // Custom props inside
  mergedCalendarEvents = [],
  subscribedEventIds = [],
  setSubscribedEventIds = () => {},
  alertSoundOn = true,
  setAlertSoundOn = () => {},
  calendarToast = null,
  setCalendarToast = () => {},
  onNavigate = () => {},
  onAddNotification,
  onMarkNotificationRead,
  eventRelatedNotifications = [],
  currentUser = null,
  playPluckSynth
}: AestheticWidgetsProps) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = isOpenCalendarDropdown !== undefined ? isOpenCalendarDropdown : localIsOpen;
  const setIsOpen = setIsOpenCalendarDropdown !== undefined ? setIsOpenCalendarDropdown : setLocalIsOpen;
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<CityWeather>(CITIES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'calendar' | 'upcoming'>('calendar');
  const [calMonth, setCalMonth] = useState<number>(5); // June (5, 0-indexed)
  const [calYear, setCalYear] = useState<number>(2026);
  const [selectedDayEvent, setSelectedDayEvent] = useState<any | null>(null);

  // Dynamic system clock/calendar tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Dropdown dismissal helper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Geolocation logic
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Find the closest city in Turkey from our pre-defined Turkish cities
          let closest = CITIES[0];
          let minDistance = Infinity;

          CITIES.forEach((city) => {
            const dist = Math.sqrt(
              Math.pow(city.lat - latitude, 2) + Math.pow(city.lon - longitude, 2)
            );
            if (dist < minDistance) {
              minDistance = dist;
              closest = city;
            }
          });

          // Simulate slight variation in temperature based on local variance / current season
          const hour = new Date().getHours();
          let baseTemp = closest.temp;
          if (hour < 6 || hour > 21) {
            baseTemp -= 4; // cooler at night
          } else if (hour > 11 && hour < 16) {
            baseTemp += 2; // hotter in midday
          }

          setSelectedCity({
            ...closest,
            temp: Math.round(baseTemp)
          });
        },
        (error) => {
          console.log('Location access declined or unavailable, defaulting to İstanbul.', error);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
      );
    }
  }, []);

  // Format Helper for Turkish Dates
  const formatTurkishDate = (date: Date) => {
    const days = [
      'Pazar',
      'Pazartesi',
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi'
    ];
    const months = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık'
    ];

    const dayName = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return {
      dayName,
      fullDate: `${dayOfMonth} ${monthName} ${year}`
    };
  };

  const { dayName, fullDate } = formatTurkishDate(currentDate);

  // Weather Icon Renderer
  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow animate-pulse" />;
      case 'cloud-sun':
        return <CloudSun className="w-5 h-5 text-sky-400 dark:text-sky-300" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-indigo-400" />;
      case 'cloud':
      default:
        return <Cloud className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />;
    }
  };

  const handleCitySelect = (city: CityWeather) => {
    setSelectedCity(city);
    setShowDropdown(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
    setSelectedDayEvent(null);
    if (playPluckSynth) playPluckSynth('click');
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
    setSelectedDayEvent(null);
    if (playPluckSynth) playPluckSynth('click');
  };

  return (
    <div className="hidden sm:flex items-center gap-4 md:gap-6 select-none shrink-0 border-l border-zinc-150 dark:border-zinc-850/80 pl-4 md:pl-5 ml-2 md:ml-3.5">
      
      {/* 1. CALENDAR WIDGET */}
      <div 
        id="navbar-calendar-widget"
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          type="button"
          onClick={() => {
            if (playPluckSynth) playPluckSynth('click');
            if (onNavigate) onNavigate('events');
            setIsOpen(false);
          }}
          className="flex items-center gap-2.5 group transition-all duration-300 cursor-pointer text-left focus:outline-none"
        >
          <div className="relative p-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/80 transition-all group-hover:scale-105">
            <CalendarIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-amber-500 transition-colors" />
            {mergedCalendarEventsCount > 0 && (
              <span id="calendar-event-badge-new" className="absolute top-[-5px] right-[-5px] min-w-[17px] h-[17px] bg-[#FF9800] text-zinc-950 font-sans font-black text-[9.5px] leading-none flex items-center justify-center rounded-full shadow border border-white dark:border-zinc-900 animate-pulse">
                {mergedCalendarEventsCount}
              </span>
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11.5px] font-sans font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {dayName}
            </span>
            <span className="text-[10px] font-sans font-medium text-zinc-450 dark:text-zinc-500 tracking-tight">
              {fullDate}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="calendar-event-panel"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-[-15px] pt-2.5 w-[335px] sm:w-[370px] z-[99999]"
            >
              {/* Transparent pointer-hover helper to seal the physical boundary gap zone */}
              <div className="absolute left-0 right-0 top-0 h-2.5 bg-transparent z-10" />

              {/* Top Arrow Pointer pointing to Calendar Icon */}
              <div className="absolute top-2.5 left-[22px] w-3.5 h-3.5 -mt-1.5 rotate-45 bg-white dark:bg-[#111424] border-t border-l border-zinc-200/60 dark:border-white/5 z-20" />

              <div className="glass-panel rounded-2xl py-3 overflow-hidden relative shadow-2xl z-30 bg-white dark:bg-[#0c0d1b] border border-zinc-200 dark:border-white/10 text-left">
                {/* Amber Gradient Accent Stripe for Calendar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
                
                <div className="flex items-center justify-between px-4 pb-2.5 border-b border-zinc-150/50 dark:border-zinc-800/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sans font-bold text-zinc-855 dark:text-zinc-50">📅 Etkinlik Takvimi</span>
                    {mergedCalendarEventsCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500 text-zinc-950 rounded-full leading-none">
                        {mergedCalendarEventsCount}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('search', { query: '', category: 'etkinlikler' });
                      setIsOpen(false);
                    }}
                    className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:opacity-80 transition-colors"
                  >
                    Tümünü Gör
                  </button>
                </div>

                {/* TABS Switcher (Takvim vs Yaklaşan Etkinlikler Listesi) */}
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-150/50 dark:border-zinc-800/60 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('calendar'); if (playPluckSynth) playPluckSynth('click'); }}
                    className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeTab === 'calendar'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/20'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350 border border-transparent'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Takvim
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('upcoming'); if (playPluckSynth) playPluckSynth('click'); }}
                    className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeTab === 'upcoming'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/20'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350 border border-transparent'
                    }`}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </span>
                    Yaklaşanlar
                  </button>
                </div>

                {/* TAB CONTENT */}
                {activeTab === 'calendar' ? (
                  <div className="p-3.5 space-y-3">
                    {/* Month Navigator controls */}
                    <div className="flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30 p-2 rounded-xl border border-zinc-100 dark:border-white/5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-zinc-250/50 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer"
                        title="Önceki Ay"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11.5px] font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wider font-sans">
                        {(() => {
                          const TURKISH_MONTHS = [
                            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
                          ];
                          return `${TURKISH_MONTHS[calMonth]} ${calYear}`;
                        })()}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-zinc-250/50 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer"
                        title="Sonraki Ay"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Classic Calendar Day-by-Day Grid picker */}
                    <div>
                      {/* Weekday titles */}
                      <div className="grid grid-cols-7 text-center font-sans text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pb-1 border-b border-zinc-100 dark:border-white/5">
                        {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((day) => (
                          <div key={day}>{day}</div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-1 mt-2 text-center text-[10.5px] font-bold">
                        {(() => {
                          const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                          const firstDayDate = new Date(calYear, calMonth, 1);
                          let firstDayIndex = firstDayDate.getDay(); // 0 = Sunday, 1 = Monday...
                          const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

                          const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
                          const cells = [];

                          // 1. Previous month cells
                          for (let i = startOffset - 1; i >= 0; i--) {
                            cells.push({
                              day: prevMonthDays - i,
                              month: calMonth === 0 ? 11 : calMonth - 1,
                              year: calMonth === 0 ? calYear - 1 : calYear,
                              isCurrentMonth: false,
                            });
                          }

                          // 2. Current month cells
                          for (let i = 1; i <= daysInMonth; i++) {
                            cells.push({
                              day: i,
                              month: calMonth,
                              year: calYear,
                              isCurrentMonth: true,
                            });
                          }

                          // 3. Next month cells
                          const totalCells = cells.length;
                          const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                          for (let i = 1; i <= remaining; i++) {
                            cells.push({
                              day: i,
                              month: calMonth === 11 ? 0 : calMonth + 1,
                              year: calMonth === 11 ? calYear + 1 : calYear,
                              isCurrentMonth: false,
                            });
                          }

                          return cells.map((cell, idx) => {
                            const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                            const isToday = cell.day === 23 && cell.month === 5 && cell.year === 2026; // June 23, 2026 is system current time today!

                            // Find event for this day
                            const dayEvents = mergedCalendarEvents.filter(evt => {
                              const startCompare = new Date(evt.date);
                              startCompare.setHours(0,0,0,0);
                              const endCompare = new Date(startCompare);
                              endCompare.setDate(startCompare.getDate() + (evt.durationDays || 1) - 1);
                              endCompare.setHours(23,59,59,999);

                              const cellDate = new Date(cell.year, cell.month, cell.day);
                              return cellDate >= startCompare && cellDate <= endCompare;
                            });

                            const hasEvents = dayEvents.length > 0;
                            const isSelected = selectedDayEvent && dayEvents.some(de => de.id === selectedDayEvent.id);

                            return (
                              <button
                                key={`${dateStr}-${idx}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasEvents) {
                                    setSelectedDayEvent(dayEvents[0]);
                                    if (playPluckSynth) playPluckSynth('click');
                                  } else {
                                    setSelectedDayEvent(null);
                                  }
                                }}
                                className={`h-7 w-full rounded-md flex flex-col items-center justify-center relative transition-all select-none border cursor-pointer ${
                                  cell.isCurrentMonth
                                    ? 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                                    : 'text-zinc-400 dark:text-zinc-600 opacity-40 hover:bg-transparent'
                                } ${
                                  isToday
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-black'
                                    : isSelected
                                      ? 'bg-amber-500 text-zinc-950 font-black border-amber-500 shadow-sm'
                                      : 'border-transparent'
                                }`}
                              >
                                <span>{cell.day}</span>
                                
                                {/* Event indicator line for multi-day/single-day */}
                                {hasEvents && !isSelected && (
                                  <span className="absolute bottom-[2.5px] left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-amber-500 dark:bg-amber-400" />
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Selected Day Event Drawer / Detail Block */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
                      {selectedDayEvent ? (
                        <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2 text-left relative animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedDayEvent(null); }}
                            className="absolute top-2 right-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            ✕
                          </button>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-amber-500 text-zinc-950 text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded">
                              SEÇİLEN GÜN
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono">
                              🗓️ {selectedDayEvent.date} {selectedDayEvent.time ? `• ${selectedDayEvent.time}` : ''}
                            </span>
                          </div>
                          <h5 className="text-[11.5px] font-bold text-zinc-855 dark:text-zinc-50 leading-snug">
                            {selectedDayEvent.title}
                          </h5>
                          {selectedDayEvent.description && (
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                              {selectedDayEvent.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigate) {
                                  if (selectedDayEvent.id.startsWith('evt-')) {
                                    onNavigate('events');
                                  } else {
                                    onNavigate(`article/${selectedDayEvent.id}`);
                                  }
                                }
                                setIsOpen(false);
                              }}
                              className="text-[9.5px] text-[#0D62FE] dark:text-amber-400 font-black flex items-center gap-1 hover:underline"
                            >
                              Detayları Gör <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (setSubscribedEventIds) {
                                  const isSub = subscribedEventIds.includes(selectedDayEvent.id);
                                  let updated;
                                  if (isSub) {
                                    updated = subscribedEventIds.filter(id => id !== selectedDayEvent.id);
                                    if (setCalendarToast) setCalendarToast({ message: `"${selectedDayEvent.title}" hatırlatıcısı kaldırıldı.`, type: 'info' });
                                  } else {
                                    updated = [...subscribedEventIds, selectedDayEvent.id];
                                    if (setCalendarToast) setCalendarToast({ message: `"${selectedDayEvent.title}" için bildirim planlandı!`, type: 'success' });
                                  }
                                  setSubscribedEventIds(updated);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all ${
                                subscribedEventIds.includes(selectedDayEvent.id)
                                  ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-amber-500'
                              }`}
                            >
                              {subscribedEventIds.includes(selectedDayEvent.id) ? '🔔 ALARM AÇIK' : '🔕 ALARM KUR'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-center bg-zinc-50/50 dark:bg-zinc-900/10 border border-dashed border-zinc-200/50 dark:border-white/5 rounded-xl">
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-555 italic font-medium">
                            Takvimde işaretli (altı çizgili) bir güne tıklayarak etkinlik detaylarını inceleyebilir ve alarm kurabilirsiniz. ⚡
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* CANLI ALARM MOTORU Control Toggle Bar */}
                    <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/5 border-b border-zinc-150/50 dark:border-zinc-805 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-sans font-bold text-amber-800 dark:text-zinc-350 uppercase tracking-wider font-mono">ETKİNLİK ALARMLARI</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${alertSoundOn ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                      </div>
                      <button
                        type="button"
                        title={alertSoundOn ? "Sinyal sesini kapat" : "Sinyal sesini aç"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (setAlertSoundOn) {
                            setAlertSoundOn(!alertSoundOn);
                          }
                          if (!alertSoundOn && typeof playPluckSynth !== 'undefined' && playPluckSynth) {
                            playPluckSynth('success');
                          }
                        }}
                        className={`p-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                          alertSoundOn
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-50 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500 border-zinc-200/50 dark:border-white/5'
                        }`}
                      >
                        {alertSoundOn ? '🔊 Ses Açık' : '🔇 Sessiz'}
                      </button>
                    </div>
                    
                    {/* Interactive Calendar Notification Toast Banner inside the dropdown */}
                    {calendarToast && (
                      <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[10.5px] font-sans font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between gap-1.5">
                        <span>🔔 {calendarToast.message}</span>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); if (setCalendarToast) setCalendarToast(null); }} 
                          className="text-[9px] hover:underline font-black uppercase text-amber-600 dark:text-amber-400 cursor-pointer"
                        >
                          Tamam
                        </button>
                      </div>
                    )}

                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/40 scrollbar-none">
                      {mergedCalendarEvents.length === 0 ? (
                        <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                          <CalendarIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-650 mb-2" />
                          <p className="text-xs font-sans font-bold text-zinc-855 dark:text-zinc-200">Kayıtlı Etkinlik Yok</p>
                          <p className="text-[10px] font-sans text-zinc-450 dark:text-zinc-500 mt-1">
                            Şu an için yaklaşan bir sektör etkinliği bulunmamaktadır.
                          </p>
                        </div>
                      ) : (
                        [...mergedCalendarEvents]
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((evt) => {
                            const dateObj = new Date(evt.date);
                            const day = dateObj.getDate();
                            const monthStr = dateObj.toLocaleDateString('tr-TR', { month: 'short' });
                            const hasNotification = subscribedEventIds.includes(evt.id);
                            
                            // Check if there are any unread alerts/notifications related to this event
                            const hasUnreadAlert = eventRelatedNotifications.some(n => !n.isRead && (n.link === evt.id || n.link === `article/${evt.id}`));

                            return (
                              <div 
                                key={evt.id} 
                                className="p-3.5 hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-colors flex items-start gap-3 relative group/item"
                              >
                                {/* Detailed Cal Stamp Card */}
                                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 flex flex-col items-center justify-center">
                                  <span className="text-xs font-serif font-black text-amber-600 dark:text-amber-400">{day}</span>
                                  <span className="text-[9px] font-sans font-bold text-amber-500 uppercase tracking-tighter leading-none mt-0.5">{monthStr}</span>
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] font-sans font-black text-amber-700 dark:text-amber-400 tracking-wider uppercase">
                                      {evt.category || 'SEKTÖREL'}
                                    </span>
                                    {evt.time && (
                                      <span className="text-[9px] font-sans font-bold text-zinc-400 dark:text-zinc-500">
                                        • {evt.time}
                                      </span>
                                    )}
                                    {hasUnreadAlert && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    )}
                                  </div>
                                  <h4 className="text-zinc-[850] dark:text-zinc-100 font-bold text-xs leading-snug mt-0.5 group-hover/item:text-[#0D62FE] dark:group-hover/item:text-amber-400 transition-colors">
                                    {evt.title}
                                  </h4>
                                  {evt.description && (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] leading-relaxed mt-1 line-clamp-2">
                                      {evt.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <button 
                                      onClick={() => {
                                        if (onNavigate) {
                                          if (evt.id.startsWith('evt-')) {
                                            // Dynamic URL redirect
                                          } else {
                                            onNavigate(`article/${evt.id}`);
                                          }
                                        }
                                        setIsOpen(false);
                                      }}
                                      className="text-[9.5px] text-zinc-450 dark:text-zinc-500 hover:text-[#0D62FE] dark:hover:text-[#da85fc] font-sans font-bold flex items-center gap-1"
                                    >
                                      Detaylar <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center self-center">
                                  <button
                                    type="button"
                                    title={hasNotification ? "Hatırlatıcı Kapat" : "Beni Hatırlat / Alarm Ekle"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (setSubscribedEventIds) {
                                        let updated;
                                        if (hasNotification) {
                                          updated = subscribedEventIds.filter(id => id !== evt.id);
                                          if (setCalendarToast) {
                                            setCalendarToast({ message: `"${evt.title}" hatırlatıcısı kaldırıldı.`, type: 'info' });
                                          }
                                          if (alertSoundOn && playPluckSynth) {
                                            playPluckSynth('error');
                                          }
                                        } else {
                                          updated = [...subscribedEventIds, evt.id];
                                          if (setCalendarToast) {
                                            setCalendarToast({ message: `"${evt.title}" için bildirim planlandı!`, type: 'success' });
                                          }
                                          if (alertSoundOn && playPluckSynth) {
                                            playPluckSynth('success');
                                          }

                                          // Dispatch to main system
                                          if (onAddNotification) {
                                            const formattedTime = evt.time ? ` saat ${evt.time}'da` : '';
                                            onAddNotification({
                                              id: `evt-notif-auto-${evt.id}-${Date.now()}`,
                                              userId: currentUser?.id || 'visitor_user',
                                              type: 'newPost',
                                              title: `🔔 Takvim Alarmları: ${evt.title}`,
                                              description: `${evt.date} tarihindeki${formattedTime} sektörel etkinlik ve canlı yayın için anlık hatırlatıcı kaydınız alındı.`,
                                              createdAt: new Date().toISOString(),
                                              isRead: false,
                                              link: !evt.id.startsWith('evt-') ? `article/${evt.id}` : undefined
                                            });
                                          }
                                        }
                                        setSubscribedEventIds(updated);
                                      }
                                    }}
                                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                      hasNotification
                                        ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-550 border-zinc-200/50 dark:border-white/5 hover:text-amber-500 hover:border-amber-500/30'
                                    }`}
                                  >
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. WEATHER WIDGET WITH DROPDOWN */}
      <div 
        ref={dropdownRef}
        id="navbar-weather-widget"
        className="relative flex items-center gap-2.5 group/weather transition-all duration-300"
      >
        {/* Custom trigger */}
        <div 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2.5 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 px-1.5 py-1 rounded-xl transition-all active:scale-98"
          title="Şehir Değiştir"
        >
          <div className="p-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
            {renderWeatherIcon(selectedCity.icon)}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-0.5">
              <span className="text-[11.5px] font-sans font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                {selectedCity.temp}° {selectedCity.condition}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 dark:text-zinc-550 transition-transform group-hover/weather:translate-y-0.5" />
            </div>
            <span className="text-[10px] font-sans font-medium text-zinc-450 dark:text-zinc-500 tracking-tight flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#0D62FE]/80" />
              {selectedCity.name}
            </span>
          </div>
        </div>

        {/* Premium Dropdown Option Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-[115%] mt-1 w-44 glass-panel rounded-2xl py-2 z-[99999] animate-in fade-in slide-in-from-top-2 duration-120">
            <div className="px-3.5 py-1 border-b border-zinc-100 dark:border-zinc-900 mb-1">
              <p className="text-[9.5px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-black">Şehir Seçin</p>
            </div>
            <div className="max-h-56 overflow-y-auto custom-scrollbar">
              {CITIES.map((city) => {
                const isSelected = city.name === selectedCity.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'text-[#0D62FE] dark:text-[#E5C158] bg-zinc-50/70 dark:bg-zinc-900/40 font-bold' 
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{city.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
