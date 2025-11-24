'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './shadcn-big-calendar.css';

const locales = {
  'en-US': enUS,
  ar: ar,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }), // Sunday
  getDay,
  locales,
});

export { Calendar as ShadcnBigCalendar, localizer };
